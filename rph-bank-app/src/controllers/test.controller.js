export function endpointTest(req, res) {
    res.status(200).json({
        "message":"Endpoint works"
    });
}