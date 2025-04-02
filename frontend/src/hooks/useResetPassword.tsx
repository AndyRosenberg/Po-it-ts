import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
}

export const useResetPassword = () => {
  const { mutate: resetPassword, isPending: loading, isSuccess } = useMutation({
    mutationFn: async (inputs: ResetPasswordInput) => {
      const response = await fetch(
        `${process.env.HOST_DOMAIN}/api/auth/reset-password`,
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
      toast.success("Password has been reset successfully");
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast.error(error.message);
    }
  });

  return { resetPassword, loading, isSuccess };
};