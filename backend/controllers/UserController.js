const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    //on recupere les donnees entres par l'utilisateur
    const { name, email, password } = req.body;
    //on verifie si tous les champs sont bien remplis!
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required to be filled !" });
    }

    // SECURITY FIX: removed automatic "staff" role assignment based on the
    // submitted email's domain (STAFF_DOMAINS). There is no email
    // verification/confirmation flow in this app, so a user could
    // previously type ANY email ending in an allowed domain (without
    // proving ownership of it) and be granted staff privileges immediately
    // upon registration.
    //
    // All new self-registrations are now "student" by default. Staff
    // accounts must be created via an explicit action by an existing staff
    // member (see exports.promoteToStaff below), or bootstrapped manually
    // for the very first account (see backend README / deployment notes).
    const newUser = new UserModel({
      name: name,
      email: email,
      password: password,
      role: "student",
    });

    await newUser.save();

    res.status(201).json({
      message: "USER CREATED SUCCESFULY",
      newUser: {
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "duplicate key error" });
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json("Error, please fill your correct email & password !");

  try {
    const user = await UserModel.findOne({ email: email });

    // SECURITY FIX: removed implicit staff-account creation via shared
    // STAFF_CODES password. Staff accounts must now be created explicitly
    // (via /register with an authorized email domain, or provisioned
    // directly). A non-existent user always results in "wrong credentials".
    if (!user) {
      return res.status(401).json({ message: "wrong credentials" });
    }

    let isMatch = false;

    if (user.role === "staff") {
      // Staff credentials are validated with staff code (userCode) or legacy password hash
      if (user.userCode && password === user.userCode) {
        isMatch = true;
      } else {
        isMatch = await user.comparePassword(password);
      }
    } else {
      isMatch = await user.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "wrong credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "72H",
      },
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userCode: user.userCode,
        createdAt: user.createdAt,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    console.log("Updating password for user:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Ancien et nouveau mot de passe requis" });
    }
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    // 2. Chercher l'utilisateur
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // 3. Vérifier si l'ancien mot de passe est correct
    let isMatch = await user.comparePassword(oldPassword);

    // Keystore fallback: staff users can change password using staff code as old password
    if (!isMatch && user.role === "staff" && user.userCode && oldPassword === user.userCode) {
      isMatch = true;
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "L'ancien mot de passe est incorrect" });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }
    // 4. Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW (replaces the STAFF_DOMAINS/STAFF_CODES auto-assignment mechanisms):
// lets an existing staff member promote another registered user to staff.
// Protected by authMiddleware + onlyStaffAllow at the route level — only
// current staff can create new staff. This is the legitimate replacement
// path for granting staff access in a real university deployment.
exports.promoteToStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (targetUser.role === "staff") {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre du staff" });
    }

    targetUser.role = "staff";
    await targetUser.save();

    res.status(200).json({
      message: `${targetUser.name} a été promu(e) membre du staff.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
