const yup = require("yup");

const userSchema = yup.object().shape({
  firstname: yup
    .string()
    .required("First name is required")
    .min(3, "First name must be at least 3 characters")
    .max(50, "First name must be at most 50 characters"),

  lastname: yup
    .string()
    .required("Last name is required")
    .min(3, "Last name must be at least 3 characters")
    .max(50, "Last name must be at most 50 characters"),

  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

module.exports = userSchema;
