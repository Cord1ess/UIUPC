import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface FormData {
  name: string;
  studentId: string;
  email: string;
  department: string;
  phone: string;
  interests: string;
  experience: string;
  message: string;
  paymentMethod: string;
  receiverName: string;
  transactionId: string;
  facebookLink: string;
  bloodGroup: string;
}

export const useRegistrationForm = (initialData: FormData, endpointUrl: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [photo, setPhoto] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      receiverName: "",
      transactionId: "",
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }
      setPhoto(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInitialSubmit = (e: React.FormEvent, isEnabled: boolean) => {
    e.preventDefault();
    if (!isEnabled) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Membership applications are currently disabled. Please check back later or contact the photography club for more information."
      );
      return;
    }
    setShowRulesPopup(true);
  };

  const handleFinalSubmit = async () => {
    if (!agreementAccepted) {
      alert("Please accept the membership agreement to continue.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setShowRulesPopup(false);

    if (formData.paymentMethod === "cash" && !formData.receiverName) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter the receiver name for cash payment.");
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentMethod === "online" && !formData.transactionId) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter the transaction ID for online payment.");
      setIsSubmitting(false);
      return;
    }

    try {
      let photoData = null;
      let photoName = null;
      let photoType = null;

      if (photo) {
        photoData = await convertToBase64(photo);
        photoName = photo.name;
        photoType = photo.type;
      }

      const submissionData = new URLSearchParams();
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (val) {
          submissionData.append(key, val);
        }
      });

      if (photoData) {
        submissionData.append("photoData", photoData);
        submissionData.append("photoName", photoName || "");
        submissionData.append("photoType", photoType || "");
      }

      submissionData.append("agreementAccepted", "true");
      submissionData.append("timestamp", new Date().toISOString());

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: submissionData.toString(),
      });

      try {
        await supabase.from('members').insert([{
          full_name: formData.name,
          student_id: formData.studentId,
          email: formData.email,
          department: formData.department,
          phone: formData.phone,
          blood_group: formData.bloodGroup,
          facebook_link: formData.facebookLink,
          payment_method: formData.paymentMethod,
          transaction_id: formData.transactionId || formData.receiverName,
          amount: "500", // Default membership fee
          notes: formData.message,
          session: "Fall 25" // Current session
        }]);
      } catch (sbError) {
        console.error("Supabase sync error:", sbError);
      }

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setIsSubmitting(false);
        setSubmitStatus("success");
        setSubmitMessage("Thank you for your application! We will review it and get back to you soon.");
        setShowSuccessPopup(true);
        setFormData(initialData);
        setPhoto(null);
        setAgreementAccepted(false);
      } else {
        throw new Error(result.message || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      setSubmitStatus("error");
      setSubmitMessage("Sorry, there was an error submitting your application. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setPhoto(null);
    setAgreementAccepted(false);
    setSubmitStatus(null);
    setSubmitMessage("");
    setShowSuccessPopup(false);
    setShowRulesPopup(false);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    submitStatus,
    submitMessage,
    showSuccessPopup,
    setShowSuccessPopup,
    showRulesPopup,
    setShowRulesPopup,
    agreementAccepted,
    setAgreementAccepted,
    photo,
    handleInputChange,
    handlePaymentMethodChange,
    handlePhotoChange,
    handleInitialSubmit,
    handleFinalSubmit,
    resetForm,
  };
};
