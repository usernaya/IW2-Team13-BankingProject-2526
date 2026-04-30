export async function getBankInfo(req, res) {
  const info = {
    bank: {
      name: "Bank2",
      bic: process.env.BIC || "FMMSBEB1"
    },
    team: {
      members: [
        "Team Member 1",
        "Team Member 2",
        "Team Member 3"
      ]
    }
  };
  res.status(200).json(info);
}