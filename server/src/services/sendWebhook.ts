export const sendWebhook = async (
  destinationUrl: string,
  event: { type: string; payload: unknown },
) => {
  const response = await fetch(destinationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  return {
    success: response.ok,
    statusCode: response.status,
  };
};
