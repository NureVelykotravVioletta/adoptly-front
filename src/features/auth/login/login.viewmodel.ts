"use client";

import { useState } from "react";
import {
  getLoginFieldError,
  getLoginFormErrors,
} from "@/src/features/auth/login/login.schema";
import {
  type LoginActionState,
  type LoginFieldName,
  type LoginFormErrors,
  type LoginFormValues,
  initialLoginFormValues,
} from "@/src/features/auth/login/login.types";

export function useLoginViewModel(actionState: LoginActionState) {
  const [values, setValues] = useState<LoginFormValues>(initialLoginFormValues);
  const [clientErrors, setClientErrors] = useState<LoginFormErrors>({});

  const getFormValues = (form: HTMLFormElement): LoginFormValues => {
    const formData = new FormData(form);

    return {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
  };

  const displayedErrors: LoginFormErrors = {
    ...actionState.fieldErrors,
    ...clientErrors,
  };

  const validateField = (
    fieldName: LoginFieldName,
    nextValues: LoginFormValues,
  ) => getLoginFieldError(nextValues, fieldName);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as LoginFieldName;
    const nextValues = {
      ...values,
      [fieldName]: event.target.value,
    };

    setValues(nextValues);
    setClientErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, nextValues),
    }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as LoginFieldName;

    setClientErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, values),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const nextValues = getFormValues(event.currentTarget);
    const nextErrors = getLoginFormErrors(nextValues);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setValues(nextValues);
      setClientErrors(nextErrors);
    }
  };

  const getInputProps = (
    fieldName: LoginFieldName,
    type: "text" | "email" | "password" = "text",
  ) => ({
    name: fieldName,
    type,
    value: values[fieldName],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": Boolean(displayedErrors[fieldName]),
    "aria-describedby": displayedErrors[fieldName]
      ? `${fieldName}-error`
      : undefined,
  });

  return {
    displayedErrors,
    handleSubmit,
    getInputProps,
  };
}
