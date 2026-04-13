const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

router.post("/", async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    email,
    password,
    marketingUpdates,
  } = req.body;

  try {
    // 1. Create the user in Supabase Auth with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName: firstName,
          lastName: lastName,
          accountType: accountType,
          marketingUpdates: marketingUpdates,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Failed to create user account." });
    }

    // 2. Insert additional user data into the 'profiles' or 'users' public table
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId, // Link to auth.users id
        first_name: firstName,
        last_name: lastName,
        account_type: accountType,
        marketing_updates: marketingUpdates,
        email: email
      },
    ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Depending on your error handling, you might want to return here, but auth succeeded.
    }

    res.status(201).json({
      message: "User created successfully",
      user: authData.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
