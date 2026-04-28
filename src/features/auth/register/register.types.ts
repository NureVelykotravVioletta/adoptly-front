export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFieldName = keyof RegisterFormValues;

export type RegisterFormErrors = Partial<Record<RegisterFieldName, string>>;

export type RegisterActionState = {
  error: string | null;
  fieldErrors: RegisterFormErrors;
};

export const initialRegisterActionState: RegisterActionState = {
  error: null,
  fieldErrors: {},
};

export const initialRegisterFormValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
