// Calendar Integration Service
// Handles Google Calendar and Outlook integration

class CalendarService {
  constructor() {
    this.googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.outlookClientId = process.env.REACT_APP_OUTLOOK_CLIENT_ID;
  }

  // Google Calendar Integration
  async initializeGoogleCalendar() {
    try {
      // Load Google Calendar API
      await this.loadGoogleAPI();
      
      // Initialize Google Auth
      await window.gapi.auth2.init({
        client_id: this.googleClientId,
        scope: 'https://www.googleapis.com/auth/calendar'
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
            clientId: this.googleClientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          }).then(resolve).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createGoogleCalendarEvent(booking) {
    try {
      const event = {
        summary: `${booking.service_name} - ${booking.pet_name}`,
        description: `PetConnect Appointment\n\nService: ${booking.service_name}\nPet: ${booking.pet_name}\nProvider: ${booking.provider_name}\nNotes: ${booking.special_instructions || 'None'}`,
        start: {
          dateTime: `${booking.booking_date}T${booking.booking_time}:00`,
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: this.calculateEndTime(booking.booking_date, booking.booking_time, booking.duration_minutes),
          timeZone: 'America/Los_Angeles',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        attendees: [
          { email: booking.user_email, displayName: booking.user_name }
        ],
        location: booking.provider_address || 'TBD',
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.result.id;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      throw error;
    }
  }

  async updateGoogleCalendarEvent(eventId, booking) {
    try {
      const event = {
        summary: `${booking.service_name} - ${booking.pet_name}`,
        description: `PetConnect Appointment\n\nService: ${booking.service_name}\nPet: ${booking.pet_name}\nProvider: ${booking.provider_name}\nNotes: ${booking.special_instructions || 'None'}`,
        start: {
          dateTime: `${booking.booking_date}T${booking.booking_time}:00`,
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: this.calculateEndTime(booking.booking_date, booking.booking_time, booking.duration_minutes),
          timeZone: 'America/Los_Angeles',
        },
      };

      const response = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return response.result;
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      throw error;
    }
  }

  async deleteGoogleCalendarEvent(eventId) {
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      return true;
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      throw error;
    }
  }

  // Outlook Calendar Integration
  async initializeOutlookCalendar() {
    try {
      // Check if Microsoft Graph is available
      if (!window.microsoft) {
        await this.loadMicrosoftGraph();
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize Outlook Calendar:', error);
      return false;
    }
  }

  async loadMicrosoftGraph() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.0.0-beta.4/msal-browser.min.js';
      script.onload = () => {
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createOutlookCalendarEvent(booking) {
    try {
      const event = {
        subject: `${booking.service_name} - ${booking.pet_name}`,
        body: {
          contentType: 'HTML',
          content: `
            <h3>PetConnect Appointment</h3>
            <p><strong>Service:</strong> ${booking.service_name}</p>
            <p><strong>Pet:</strong> ${booking.pet_name}</p>
            <p><strong>Provider:</strong> ${booking.provider_name}</p>
            <p><strong>Notes:</strong> ${booking.special_instructions || 'None'}</p>
          `
        },
        start: {
          dateTime: `${booking.booking_date}T${booking.booking_time}:00`,
          timeZone: 'Pacific Standard Time',
        },
        end: {
          dateTime: this.calculateEndTime(booking.booking_date, booking.booking_time, booking.duration_minutes),
          timeZone: 'Pacific Standard Time',
        },
        location: {
          displayName: booking.provider_address || 'TBD'
        },
        attendees: [
          {
            emailAddress: {
              address: booking.user_email,
              name: booking.user_name
            },
            type: 'required'
          }
        ],
        reminderMinutesBeforeStart: 60,
      };

      // This would require Microsoft Graph API implementation
      // For now, we'll return a placeholder
      return 'outlook-event-id-placeholder';
    } catch (error) {
      console.error('Failed to create Outlook Calendar event:', error);
      throw error;
    }
  }

  // Utility Methods
  calculateEndTime(date, time, durationMinutes) {
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (durationMinutes * 60000));
    return endDateTime.toISOString().slice(0, 19);
  }

  // Calendar Provider Detection
  detectCalendarProvider() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('outlook') || userAgent.includes('microsoft')) {
      return 'outlook';
    } else if (userAgent.includes('google') || userAgent.includes('chrome')) {
      return 'google';
    } else {
      return 'google'; // Default to Google
    }
  }

  // Unified Calendar Integration
  async createCalendarEvent(booking, provider = null) {
    const calendarProvider = provider || this.detectCalendarProvider();
    
    try {
      let eventId;
      
      switch (calendarProvider) {
        case 'google':
          await this.initializeGoogleCalendar();
          eventId = await this.createGoogleCalendarEvent(booking);
          break;
        case 'outlook':
          await this.initializeOutlookCalendar();
          eventId = await this.createOutlookCalendarEvent(booking);
          break;
        default:
          throw new Error('Unsupported calendar provider');
      }

      return {
        success: true,
        eventId: eventId,
        provider: calendarProvider
      };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateCalendarEvent(eventId, booking, provider) {
    try {
      switch (provider) {
        case 'google':
          return await this.updateGoogleCalendarEvent(eventId, booking);
        case 'outlook':
          // Outlook update implementation would go here
          return { success: true };
        default:
          throw new Error('Unsupported calendar provider');
      }
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(eventId, provider) {
    try {
      switch (provider) {
        case 'google':
          return await this.deleteGoogleCalendarEvent(eventId);
        case 'outlook':
          // Outlook delete implementation would go here
          return { success: true };
        default:
          throw new Error('Unsupported calendar provider');
      }
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw error;
    }
  }
}

export default new CalendarService();
