import * as Yup from 'yup';

const baseSchema = {
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
};

export const signUpValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    ...baseSchema,
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

export const loginValidationSchema = Yup.object().shape({
  ...baseSchema,
});