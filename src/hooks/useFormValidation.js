import { useState } from "react";
import toast from "react-hot-toast";

export default function useFormValidation(schema) {
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach((e) => {
          fieldErrors[e.path[0]] = e.message;
          // Show toast for password format errors
          if (e.path[0] === "password") {
            toast.error(e.message, { duration: 4000 });
          }
        });
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  return { errors, validate };
}
