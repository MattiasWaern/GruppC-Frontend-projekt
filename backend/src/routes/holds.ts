import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { viewingId, seatIds } = (req.body ?? {}) as {
    viewingId?: number;
    seatIds?: number[];
    holdToken?: string;
  };

  if (
    typeof viewingId !== "number" ||
    !Number.isInteger(viewingId) ||
    viewingId <= 0 ||
    !Array.isArray(seatIds) ||
    seatIds.length === 0 ||
    !seatIds.every((id) => Number.isInteger(id) && id > 0) ||
    new Set(seatIds).size !== seatIds.length
  ) {
    res.status(400).json({ error: "viewingId och seatIds (unika heltal) krävs" });
    return;
  }

  res.status(501).json({ error: "Reservation är inte implementerad än" });
});

export default router;