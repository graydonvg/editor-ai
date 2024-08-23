import { Flip, Id, ToastContainer, TypeOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toast() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      theme="colored"
      rtl={false}
    />
  );
}

export function handleToastUpdate(id: Id, message: string, type: TypeOptions) {
  return toast.update(id, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 4000,
    closeButton: true,
    closeOnClick: true,
    transition: Flip,
  });
}
