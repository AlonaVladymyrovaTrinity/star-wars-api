let api_url = "https://swapi.dev/api/";
//Using JavaScript Fetch API
//handling error cases: try - catch
async function getResponse(url) {
  try {
    let res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

function getCapitalized(word) {
  return (word[0].toUpperCase() + word.slice(1)).replace("_", " ");
}

export { api_url, getResponse, getCapitalized };
