import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "This browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive weekly mood check-in reminders",
        });
        scheduleWeeklyNotification();
        return true;
      } else {
        toast({
          title: "Notifications Denied",
          description: "Enable notifications in your browser settings to receive reminders",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const scheduleWeeklyNotification = () => {
    // Schedule notification for end of day (8 PM)
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(20, 0, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Aura Speak Well 💜", {
          body: "How was your day? Take a moment to log your mood and reflect.",
          icon: "/placeholder.svg",
          tag: "daily-mood-check",
          requireInteraction: false,
        });
      }
      // Reschedule for next day
      scheduleWeeklyNotification();
    }, timeUntilNotification);
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/placeholder.svg",
        tag: "mood-reminder",
      });
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: "Notification" in window,
  };
};
