export async function checkResourceProcessing(url: string) {
  try {
    const response = await fetch(url);

    if (response.ok) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
