
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    title: "Om oss",
    description:
      "Vi vill göra det enkelt för dig att upptäcka filmer och boka biobiljetter.",
  });
});

export default router;