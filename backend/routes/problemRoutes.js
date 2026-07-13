const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Middleware to verify token and get user
const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// POST /api/problems - File a new problem report
router.post("/", verifyUser, async (req, res) => {
  try {
    const { propertyId, propertyTitle, issueType, title, description } = req.body;

    if (!issueType || !title || !description) {
      return res.status(400).json({ message: "Missing required fields: issueType, title, and description are required" });
    }

    const { data, error } = await supabase
      .from("property_problems")
      .insert([
        {
          user_id: req.user.id,
          property_id: propertyId || null,
          property_title: propertyTitle || null,
          issue_type: issueType,
          title,
          description,
          status: "open",
        },
      ])
      .select();

    if (error) {
      console.error("Report problem insert error:", error);
      return res.status(500).json({ message: error.message });
    }

    // Send email using Resend API if API Key is available
    if (process.env.RESEND_API_KEY) {
      let sellerEmail = null;
      let sellerName = "Host/Landlord";

      if (propertyId) {
        try {
          const { data: property } = await supabase
            .from("properties")
            .select("seller_id")
            .eq("id", propertyId)
            .maybeSingle();

          if (property && property.seller_id) {
            const { data: sellerProfile } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", property.seller_id)
              .maybeSingle();

            if (sellerProfile) {
              sellerEmail = sellerProfile.email;
              sellerName = `${sellerProfile.first_name} ${sellerProfile.last_name}`;
            }
          }
        } catch (dbErr) {
          console.error("Failed to query seller details for email notification:", dbErr.message);
        }
      }

      if (sellerEmail) {
        try {
          const emailBody = {
            from: "BoardLanka <onboarding@resend.dev>",
            to: "himashheshan193@gmail.com",
            subject: `[BoardLanka] New Problem Report: ${title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-top: 0;">New Problem Reported</h2>
                <p>Hello,</p>
                <p>A new problem report has been submitted regarding a property listing.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Property Listing:</strong> "${propertyTitle || 'Property Listing'}"</p>
                  <p style="margin: 5px 0;"><strong>Issue Type:</strong> ${issueType}</p>
                  <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
                  <p style="margin: 5px 0;"><strong>Description:</strong></p>
                  <p style="white-space: pre-wrap; margin: 5px 0; background: #fff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px;">${description}</p>
                </div>
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 13px;">
                  <strong>Development sandbox routing:</strong><br/>
                  Original Intended Landlord: ${sellerName} (${sellerEmail})
                </div>
                <p>Please log in to the profile dashboard to view and manage this issue status.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 0;">This is an automated notification from BoardLanka.</p>
              </div>
            `
          };

          if (typeof fetch === "function") {
            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(emailBody)
            });
            const emailData = await emailRes.json();
            console.log("✓ Resend email response:", emailData);
          } else {
            const https = require("https");
            const payloadStr = JSON.stringify(emailBody);
            const reqOpts = {
              hostname: "api.resend.com",
              path: "/emails",
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payloadStr)
              }
            };
            const emailReq = https.request(reqOpts, (emailRes) => {
              let body = "";
              emailRes.on("data", chunk => body += chunk);
              emailRes.on("end", () => console.log("✓ Resend email (https fallback) response:", body));
            });
            emailReq.on("error", (err) => console.error("✗ Failed to send email via https fallback:", err));
            emailReq.write(payloadStr);
            emailReq.end();
          }
        } catch (emailErr) {
          console.error("✗ Failed to send email notification:", emailErr.message);
        }
      }
    }

    res.status(201).json({
      message: "Problem reported successfully",
      problem: data[0],
    });
  } catch (error) {
    console.error("Report problem error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/problems - Get reported problems
router.get("/", verifyUser, async (req, res) => {
  try {
    // 1. Check user account type from profiles
    let accountType = "buyer";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", req.user.id)
        .maybeSingle();

      if (profile) {
        accountType = profile.account_type;
      }
    } catch (err) {
      console.warn("Profiles check warning:", err.message);
    }

    let resultData = [];

    if (accountType === "seller") {
      // Landlord: Fetch reports for their properties
      // First find properties owned by this seller
      const { data: ownedProperties, error: propertiesError } = await supabase
        .from("properties")
        .select("id")
        .eq("seller_id", req.user.id);

      if (propertiesError) {
        console.error("Fetch owned properties error:", propertiesError);
        return res.status(500).json({ message: propertiesError.message });
      }

      const propertyIds = (ownedProperties || []).map(p => p.id);

      if (propertyIds.length === 0) {
        // No properties owned, so no reports can exist
        return res.status(200).json([]);
      }

      // Try fetching with the join first
      let { data, error } = await supabase
        .from("property_problems")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });

      if (error && error.message.includes("phone")) {
        console.warn("phone column doesn't exist in profiles table, retrying join without phone");
        const retryResult = await supabase
          .from("property_problems")
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              email
            )
          `)
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false });
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.warn("Fetch reports with profiles join failed, falling back to manual merge:", error.message);
        
        // Fallback: Fetch problems without join
        const { data: problemsData, error: problemsError } = await supabase
          .from("property_problems")
          .select("*")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false });

        if (problemsError) {
          console.error("Fetch reports fallback error:", problemsError);
          return res.status(500).json({ message: problemsError.message });
        }

        if (problemsData && problemsData.length > 0) {
          const userIds = [...new Set(problemsData.map(p => p.user_id))];
          
          // Fetch profiles for these users
          let { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, phone")
            .in("id", userIds);

          if (profilesError && profilesError.message.includes("phone")) {
            console.warn("phone column doesn't exist in profiles table, retrying profiles fetch without phone");
            const retryProfiles = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .in("id", userIds);
            profilesData = retryProfiles.data;
            profilesError = retryProfiles.error;
          }

          if (!profilesError && profilesData) {
            const profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});

            resultData = problemsData.map(p => ({
              ...p,
              profiles: profilesMap[p.user_id] || null
            }));
          } else {
            console.error("Fetch profiles fallback error:", profilesError ? profilesError.message : "No profiles found");
            resultData = problemsData.map(p => ({
              ...p,
              profiles: null
            }));
          }
        } else {
          resultData = [];
        }
      } else {
        resultData = data || [];
      }

    } else {
      // Buyer/Renter: Fetch reports submitted by them
      // Try fetching with the join first
      const { data, error } = await supabase
        .from("property_problems")
        .select(`
          *,
          properties (
            title,
            location,
            type,
            price
          )
        `)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Fetch reports with properties join failed, falling back to manual merge:", error.message);
        
        // Fallback: Fetch problems without join
        const { data: problemsData, error: problemsError } = await supabase
          .from("property_problems")
          .select("*")
          .eq("user_id", req.user.id)
          .order("created_at", { ascending: false });

        if (problemsError) {
          console.error("Fetch reports fallback error:", problemsError);
          return res.status(500).json({ message: problemsError.message });
        }

        if (problemsData && problemsData.length > 0) {
          const propertyIds = [...new Set(problemsData.map(p => p.property_id).filter(Boolean))];
          
          if (propertyIds.length > 0) {
            // Fetch properties
            const { data: propertiesData, error: propertiesError } = await supabase
              .from("properties")
              .select("id, title, location, type, price")
              .in("id", propertyIds);

            if (!propertiesError && propertiesData) {
              const propertiesMap = propertiesData.reduce((acc, prop) => {
                acc[prop.id] = prop;
                return acc;
              }, {});

              resultData = problemsData.map(p => ({
                ...p,
                properties: p.property_id ? (propertiesMap[p.property_id] || null) : null
              }));
            } else {
              resultData = problemsData.map(p => ({
                ...p,
                properties: null
              }));
            }
          } else {
            resultData = problemsData.map(p => ({
              ...p,
              properties: null
            }));
          }
        } else {
          resultData = [];
        }
      } else {
        resultData = data || [];
      }
    }

    res.status(200).json(resultData);
  } catch (error) {
    console.error("Fetch reports error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/problems/:id - Update status of problem report
router.put("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 1. Fetch current problem report
    const { data: problem, error: problemError } = await supabase
      .from("property_problems")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (problemError || !problem) {
      return res.status(404).json({ message: "Problem report not found" });
    }

    // 2. Authorize: user must be the report creator OR the landlord of the property
    let isAuthorized = problem.user_id === req.user.id;

    if (!isAuthorized && problem.property_id) {
      // Check if current user is the landlord of the reported property
      const { data: property } = await supabase
        .from("properties")
        .select("seller_id")
        .eq("id", problem.property_id)
        .maybeSingle();

      if (property && property.seller_id === req.user.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Unauthorized to update this report" });
    }

    // 3. Update report status
    const { data: updatedData, error: updateError } = await supabase
      .from("property_problems")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update report status error:", updateError);
      return res.status(500).json({ message: updateError.message });
    }

    res.status(200).json({
      message: "Report status updated successfully",
      problem: updatedData
    });

  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/problems/seed-dummy - Seed test data
router.post("/seed-dummy", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Insert dummy properties owned by current user
    const dummyProperties = [
      {
        seller_id: userId,
        title: "[DUMMY] Modern 2-Bedroom Annex in Homagama",
        description: "Beautifully designed annex with separate entrance, parking, and modern amenities close to the university. [DUMMY]",
        location: "Homagama, Colombo",
        area: "homagama",
        type: "annex",
        price: 25000.00,
        advance_payment: 75000.00,
        bedrooms: 2,
        bathrooms: 1,
        size: "850",
        amenities: ["Separate Entrance", "Parking", "AC", "Wi-Fi"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        phone: "+94 77 123 4567",
        whatsapp: "94771234567",
        available: true,
      },
      {
        seller_id: userId,
        title: "[DUMMY] Luxury 4-Bedroom House in Colombo",
        description: "Spacious luxury house in a quiet residential area of Colombo. Full security system and luxury fittings. [DUMMY]",
        location: "Colombo 03",
        area: "colombo",
        type: "house",
        price: 120000.00,
        advance_payment: 600000.00,
        bedrooms: 4,
        bathrooms: 3,
        size: "2400",
        amenities: ["Garden", "Security System", "Garage", "Hot Water"],
        images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
        phone: "+94 77 987 6543",
        whatsapp: "94779876543",
        available: true,
      },
      {
        seller_id: userId,
        title: "[DUMMY] Cozy Single Room in Katunayake",
        description: "Comfortable single room near the airport and industrial zone. Ideal for working professionals or students. Separate utility meters. [DUMMY]",
        location: "Katunayake, Gampaha",
        area: "katunayaka",
        type: "room",
        price: 9500.00,
        advance_payment: 20000.00,
        bedrooms: 1,
        bathrooms: 1,
        size: "300",
        amenities: ["Bed", "Fan", "Study Table", "Shared Kitchen"],
        images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"],
        phone: "+94 77 555 4433",
        whatsapp: "94775554433",
        available: true,
      },
      {
        seller_id: userId,
        title: "[DUMMY] 15 Perch Land in Galle Fort Area",
        description: "Excellent commercial or residential land plots located in prime tourist zone of Galle. Road frontage and secure borders. [DUMMY]",
        location: "Galle Fort, Galle",
        area: "galle",
        type: "land",
        price: 450000.00,
        advance_payment: 0.00,
        bedrooms: 0,
        bathrooms: 0,
        size: "4000",
        amenities: ["Water Connection", "Electricity Connection", "Paved Road Access", "Clear Deeds"],
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"],
        phone: "+94 77 222 1100",
        whatsapp: "94772221100",
        available: true,
      }
    ];

    const { data: insertedProps, error: propsError } = await supabase
      .from("properties")
      .insert(dummyProperties)
      .select();

    if (propsError) {
      console.error("Seed properties error:", propsError);
      return res.status(500).json({ message: propsError.message });
    }

    const prop1Id = insertedProps[0]?.id;
    const prop2Id = insertedProps[1]?.id;
    const prop3Id = insertedProps[2]?.id;

    // 2. Insert dummy problems
    const dummyProblems = [
      {
        user_id: userId,
        property_id: prop1Id || null,
        property_title: insertedProps[0]?.title || null,
        issue_type: "Maintenance",
        title: "[DUMMY] Water tap leakage in bathroom",
        description: "The main tap in the annex bathroom is leaking constantly since yesterday morning. Needs repair. [DUMMY]",
        status: "open",
      },
      {
        user_id: userId,
        property_id: prop2Id || null,
        property_title: insertedProps[1]?.title || null,
        issue_type: "Landlord Issue",
        title: "[DUMMY] Delay in garbage collection service",
        description: "The garbage collectors haven't visited this week. Requesting the host to follow up. [DUMMY]",
        status: "in-progress",
      },
      {
        user_id: userId,
        property_id: prop3Id || null,
        property_title: insertedProps[2]?.title || null,
        issue_type: "Maintenance",
        title: "[DUMMY] Ceiling fan making loud noise",
        description: "The ceiling fan in the Katunayake room makes a squeaking sound when turned on high speed. [DUMMY]",
        status: "open",
      },
      {
        user_id: userId,
        property_id: null,
        property_title: null,
        issue_type: "General Web Problem",
        title: "[DUMMY] Website search filters sometimes freeze",
        description: "When selecting area Colombo and checking house type, the page layout took long to update. [DUMMY]",
        status: "open",
      }
    ];

    const { data: insertedProblems, error: problemsError } = await supabase
      .from("property_problems")
      .insert(dummyProblems)
      .select();

    if (problemsError) {
      console.error("Seed problems error:", problemsError);
      return res.status(500).json({ message: problemsError.message });
    }

    res.status(201).json({
      message: "Test dummy data seeded successfully",
      properties: insertedProps,
      problems: insertedProblems
    });

  } catch (error) {
    console.error("Seed route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/problems/clear-dummy - Clear test data
router.post("/clear-dummy", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Delete all dummy problems reported by user
    const { error: problemsError } = await supabase
      .from("property_problems")
      .delete()
      .like("title", "%[DUMMY]%");

    if (problemsError) {
      console.error("Clear problems error:", problemsError);
      return res.status(500).json({ message: problemsError.message });
    }

    // 2. Delete all dummy properties listed by user
    const { error: propsError } = await supabase
      .from("properties")
      .delete()
      .eq("seller_id", userId)
      .like("title", "%[DUMMY]%");

    if (propsError) {
      console.error("Clear properties error:", propsError);
      return res.status(500).json({ message: propsError.message });
    }

    res.status(200).json({
      message: "Test dummy data cleared successfully"
    });

  } catch (error) {
    console.error("Clear route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
