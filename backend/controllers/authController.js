console.log("✅ authController.js cargado");

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  console.log("Intento de login:", email, password);
  return res.status(200).json({ success: true, token: "fake-jwt-token" });
};

exports.registerUser = (req, res) => {
  const { email, password } = req.body;
  console.log("Registro:", email, password);
  return res.status(201).json({ success: true, message: "Usuario registrado" });
};
