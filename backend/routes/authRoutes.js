const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Fetch additional profile data from profiles table (if it exists)
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profileError) {
        profile = profileData;
      }
    } catch (err) {
      // Table might not exist yet, continue with just auth data
      console.log("Profiles table not accessible:", err.message);
    }

    // Merge auth user with profile data
    const userData = {
      ...data.user,
      user_metadata: {
        firstName: profile?.first_name || data.user.user_metadata?.firstName || "User",
        lastName: profile?.last_name || data.user.user_metadata?.lastName || "",
        accountType: profile?.account_type || data.user.user_metadata?.accountType || "buyer",
        marketingUpdates: profile?.marketing_updates !== undefined ? profile.marketing_updates : (data.user.user_metadata?.marketingUpdates || false),
      }
    };

    res.status(200).json({
      message: "Sign in successful",
      token: data.session.access_token,
      user: userData,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/auth/profile
router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(401).json({ message: "Invalid token" });
    }

    // Try to fetch profile data from profiles table
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileError) {
        profile = profileData;
      }
    } catch (err) {
      // Table might not exist yet, continue with just auth data
      console.log("Profiles table not accessible:", err.message);
    }

    // Merge auth user with profile data
    const userData = {
      id: user.id,
      email: profile?.email || user.email,
      firstName: profile?.first_name || user.user_metadata?.firstName || "User",
      lastName: profile?.last_name || user.user_metadata?.lastName || "",
      accountType: profile?.account_type || user.user_metadata?.accountType || "buyer",
      marketingUpdates: profile?.marketing_updates !== undefined ? profile.marketing_updates : (user.user_metadata?.marketingUpdates || false),
      createdAt: profile?.created_at || user.created_at,
    };
    
    res.status(200).json({ user: userData });

  } catch (error) {
    console.error("Profile route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
