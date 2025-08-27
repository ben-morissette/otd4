import axios from "axios";

export default async function handler(req, res) {
  const { team } = req.query;

  try {
    const response = await axios.get(
      `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch team data" });
  }
}
