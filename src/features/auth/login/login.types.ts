export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFieldName = keyof LoginFormValues;

export type LoginFormErrors = Partial<Record<LoginFieldName, string>>;

export type LoginActionState = {
  error: string | null;
  fieldErrors: LoginFormErrors;
};

export const initialLoginActionState: LoginActionState = {
  error: null,
  fieldErrors: {},
};

export const initialLoginFormValues: LoginFormValues = {
  email: "",
  password: "",
};
