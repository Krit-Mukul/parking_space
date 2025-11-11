import { useState } from "react";

export default function useFormValidation(schema) {
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach((e) => {
          fieldErrors[e.path[0]] = e.message;
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
