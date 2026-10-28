import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale || "en";
  let messages = {};
  
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (e) {
    console.error(`Failed to load messages in requestConfig for: ${locale}`);
  }

  return {
    locale,
    messages,
    timeZone: "UTC",
  };
});

