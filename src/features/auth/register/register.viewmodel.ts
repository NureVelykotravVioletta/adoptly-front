"use client";

import { useState } from "react";
import {
  getRegisterFieldError,
  getRegisterFormErrors,
} from "@/src/features/auth/register/register.schema";
import {
  type RegisterActionState,
  type RegisterFieldName,
  type RegisterFormErrors,
  type RegisterFormValues,
  initialRegisterFormValues,
} from "@/src/features/auth/register/register.types";

export function useRegisterViewModel(actionState: RegisterActionState) {
  const [values, setValues] = useState<RegisterFormValues>(
    initialRegisterFormValues,
  );
  const [clientErrors, setClientErrors] = useState<RegisterFormErrors>({});

  const getFormValues = (form: HTMLFormElement): RegisterFormValues => {
    const formData = new FormData(form);

    return {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };
  };

  const displayedErrors: RegisterFormErrors = {
    ...actionState.fieldErrors,
    ...clientErrors,
  };

  const validateField = (
    fieldName: RegisterFieldName,
    nextValues: RegisterFormValues,
  ) => getRegisterFieldError(nextValues, fieldName);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as RegisterFieldName;
    const nextValues = {
      ...values,
      [fieldName]: event.target.value,
    };

    setValues(nextValues);
    setClientErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, nextValues),
      ...(fieldName === "password"
        ? {
            confirmPassword: validateField("confirmPassword", nextValues),
          }
        : {}),
    }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as RegisterFieldName;

    setClientErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, values),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const nextValues = getFormValues(event.currentTarget);
    const nextErrors = getRegisterFormErrors(nextValues);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setValues(nextValues);
      setClientErrors(nextErrors);
    }
  };

  const getInputProps = (
    fieldName: RegisterFieldName,
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
    values,
    displayedErrors,
    handleSubmit,
    getInputProps,
  };
}
