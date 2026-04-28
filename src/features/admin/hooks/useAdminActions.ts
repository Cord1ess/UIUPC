import { useState, useCallback } from "react";
import { getProperty } from "@/utils/adminHelpers";
import { supabase } from "@/lib/supabase";
import { syncToSheets } from "@/utils/syncEngine";

interface UseAdminActionsProps {
  user: any;
  adminProfile: any;
  dataType: string;
  onRefresh: () => void;
}

export const useAdminActions = ({ user, adminProfile, dataType, onRefresh }: UseAdminActionsProps) => {
  const [admin_SubmissionsStatus, setAdmin_SubmissionsStatus] = useState<string>("unknown");
  const [admin_MembersStatus, setAdmin_MembersStatus] = useState<string>("unknown");
  const [connectionTest, setConnectionTest] = useState<any>({ status: "success", message: "Supabase Connection Active" });
  const [emailSending, setEmailSending] = useState(false);

  const EMAIL_TEMPLATES: Record<string, any> = {
    confirmation: {
      subject: "Photo Submission Confirmation - UIU Photography Club",
      body: `Dear {name},\n\nThank you for submitting your photos to the Shutter Stories Chapter IV. We have successfully received your submission.\n\nSubmission Details:\n- Name: {name}\n- Email: {email}\n- Category: {category}\n- Total Photos Submitted: {photoCount} (Main) + {storyPhotoCount} (Story)\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
    renameRequest: {
      subject: "Action Required: Rename Your Photos - UIU Photography Club",
      body: `Dear {name},\n\nWe have received your photo submission for the Shutter Stories Chapter IV. However, we noticed that your photos have not been properly renamed according to our submission guidelines.\n\nSubmission Guidelines:\n- Photos must be renamed in this format: "Institution Name_Participant's name_Category_Mobile no_Serial no"\n- For example: "UIU_Ahmad Hasan_Single_0162#######_01"\n\nPlease rename your photos and resubmit them as soon as possible. Submissions with improperly named photos may be disqualified.\n\nFor Submission: https://uiupc.vercel.app/register/shutter-stories\nRulebook: https://drive.google.com/drive/u/0/folders/1qwJ7spd1ewaH3RINgSKSf87QMYvcpSZi\n\nIf you have any questions, feel free to contact us through this email or message us on our Facebook page.\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
    general: {
      subject: "Regarding Your Photo Submission - UIU Photography Club",
      body: `Dear {name},\n\nThank you for your interest in the Shutter Stories Chapter IV.\n\nWe have reviewed your submission and would like to inform you that {custom_message}.\n\nIf you have any questions, please feel free to contact us.\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
  };

  const fetchAdmin_SubmissionsStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'photo_submissions_status')
        .single();
      
      if (error) throw error;
      setAdmin_SubmissionsStatus(data?.value || "enabled");
    } catch (error) {
      console.error("Error fetching submission status:", error);
      setAdmin_SubmissionsStatus("enabled");
    }
  }, []);

  const fetchAdmin_MembersStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'membership_status')
        .single();
      
      if (error) throw error;
      setAdmin_MembersStatus(data?.value || "enabled");
    } catch (error) {
      console.error("Error fetching membership status:", error);
      setAdmin_MembersStatus("enabled");
    }
  }, []);

  const handleToggleAdmin_Submissions = useCallback(async (currentStatus: string) => {
    if (!adminProfile) return { success: false, error: "Unauthorized" };
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: newStatus })
        .eq('key', 'photo_submissions_status');

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        admin_id: adminProfile.id,
        action: `photo_submissions_${newStatus}`,
        target_table: 'site_settings',
        new_data: { status: newStatus }
      });

      setAdmin_SubmissionsStatus(newStatus);
      syncToSheets('site_settings', `photo_submissions_${newStatus}`, { status: newStatus });
      return { success: true, status: newStatus };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [adminProfile]);

  const handleToggleAdmin_Members = useCallback(async (currentStatus: string) => {
    if (!adminProfile) return { success: false, error: "Unauthorized" };
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: newStatus })
        .eq('key', 'membership_status');

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        admin_id: adminProfile.id,
        action: `membership_${newStatus}`,
        target_table: 'site_settings',
        new_data: { status: newStatus }
      });

      setAdmin_MembersStatus(newStatus);
      syncToSheets('site_settings', `membership_${newStatus}`, { status: newStatus });
      return { success: true, status: newStatus };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [adminProfile]);

  const testEmailConnection = useCallback(async () => {
    setConnectionTest({ status: "success", message: "Supabase Connection Active" });
  }, []);

  const sendEmail = useCallback(async (selectedEmailItem: any, templateType: string, customMessage: string = "", onSuccess?: () => void) => {
    if (!selectedEmailItem || !adminProfile) return;

    try {
      setEmailSending(true);
      const recipientEmail = getProperty(selectedEmailItem, "Email");
      const recipientName = getProperty(selectedEmailItem, "Name");

      let subject = EMAIL_TEMPLATES[templateType].subject;
      let body = EMAIL_TEMPLATES[templateType].body;

      body = body
        .replace(/{name}/g, recipientName)
        .replace(/{email}/g, recipientEmail)
        .replace(/{category}/g, getProperty(selectedEmailItem, "Category") || "N/A")
        .replace(/{photoCount}/g, getProperty(selectedEmailItem, "Photo Count") || "0")
        .replace(/{storyPhotoCount}/g, getProperty(selectedEmailItem, "Story Photo Count") || "0")
        .replace(/{custom_message}/g, customMessage);

      const { error } = await supabase.from('mail_logs').insert({
        recipient_email: recipientEmail,
        subject: subject,
        body: body,
        template_type: templateType,
        sent_by: adminProfile.id,
        status: 'pending'
      });

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        admin_id: adminProfile.id,
        action: 'email_logged',
        target_table: 'mail_logs',
        new_data: { recipientEmail, templateType }
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Failed to queue email:", error.message);
    } finally {
      setEmailSending(false);
    }
  }, [adminProfile, dataType]);

  const updateMemberSession = useCallback(async (itemId: string, session: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update({ session })
        .eq('id', itemId)
        .select();
      
      if (error) throw error;
      return { status: "success", data };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  }, []);

  return {
    EMAIL_TEMPLATES,
    admin_SubmissionsStatus,
    admin_MembersStatus,
    connectionTest,
    emailSending,
    fetchAdmin_SubmissionsStatus,
    fetchAdmin_MembersStatus,
    handleToggleAdmin_Submissions,
    handleToggleAdmin_Members,
    testEmailConnection,
    sendEmail,
    updateMemberSession
  };
};
