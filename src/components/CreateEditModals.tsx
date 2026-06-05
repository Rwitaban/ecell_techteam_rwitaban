/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ScheduleItem, MerchandiseItem } from "../types";
import { api } from "../lib/api";
import { X, Calendar, DollarSign, Users, Award, MapPin, Tag } from "lucide-react";

interface CreateEditEventModalProps {
  eventToEdit?: ScheduleItem | null;
  onSuccess: () => void;
  onClose: () => void;
}
