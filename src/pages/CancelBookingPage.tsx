import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router";

type Status = "form" | "loading" | "done";

interface PrefillState {
  email?: string;
  bookingNumber?: string;
}