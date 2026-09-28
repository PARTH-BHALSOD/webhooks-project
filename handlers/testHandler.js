const testHandler = async (webhookEvent) => {
    console.log("Test webhook handler running...");
    console.log("Event ID:", webhookEvent.eventId);
    console.log("Payload:", webhookEvent.payload);

    // Real business logic will go here later.

    return {
        success: true
    };
};

export default testHandler;