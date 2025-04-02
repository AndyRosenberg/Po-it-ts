import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type ForgotPasswordInput = {
  email: string;
}

export const useForgotPassword = () => {
  const { mutate: forgotPassword, isPending: loading, isSuccess } = useMutation({
    mutationFn: async (inputs: ForgotPasswordInput) => {
      const response = await fetch(
        `${process.env.HOST_DOMAIN}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputs)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("If your email exists in our system, you will receive a password reset link");
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast.error(error.message);
    }
  });

  return { forgotPassword, loading, isSuccess };
};