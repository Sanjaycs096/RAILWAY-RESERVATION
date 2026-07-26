export type UserRole = 'passenger' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended';
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    preferredClass: string;
  };
}

export interface Station {
  id: string;
  code: string; // e.g. "NDLS"
  name: string; // e.g. "New Delhi"
  city: string;
  state: string;
  zone: string; // e.g. "NR", "WR", "SR"
  platforms: number;
  latitude: number;
  longitude: number;
  amenities: string[]; // ["Wi-Fi", "Lounge", "Food Court", "ATM"]
  status: 'active' | 'inactive';
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StationStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string; // "08:15" or "START"
  departureTime: string; // "08:30" or "END"
  distanceKm: number;
  dayNumber: number;
  platformNumber: number;
  latitude?: number;
  longitude?: number;
}

export interface Route {
  id: string;
  name: string; // e.g. "Delhi - Mumbai Superfast Route"
  originCode: string;
  destinationCode: string;
  totalDistanceKm: number;
  stops: StationStop[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CoachInfo {
  type: '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC' | 'GEN';
  name: string; // e.g. "First AC", "Sleeper Class"
  totalSeats: number;
  availableSeats: number;
  fare: number;
}

export interface Train {
  id: string;
  trainNumber: string; // e.g. "12952"
  trainName: string; // e.g. "New Delhi Rajdhani Express"
  type: 'Rajdhani' | 'Shatabdi' | 'Vande Bharat' | 'Superfast' | 'Express';
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string; // e.g. "16:55"
  arrivalTime: string; // e.g. "08:35"
  duration: string; // e.g. "15h 40m"
  runsOn: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  routeId: string;
  coaches: CoachInfo[];
  status: 'On Time' | 'Delayed' | 'Cancelled' | 'Rescheduled';
  delayMinutes: number;
  currentStationCode?: string;
  nextStationCode?: string;
  currentLocationDesc?: string;
  speedKmh?: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Passenger {
  id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  berthPreference?: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'No Preference';
  isSeniorCitizen?: boolean;
  specialAssistance?: boolean;
  concessionType?: 'None' | 'Senior Citizen' | 'Student' | 'Divyangjan';
  seatAssigned?: string;
  coachAssigned?: string;
  status?: 'CONFIRMED' | 'RAC' | 'WAITLISTED';
}

export interface Seat {
  id: string;
  seatNumber: string;
  berthType: 'Window' | 'Middle' | 'Aisle' | 'Upper' | 'Lower' | 'Side Upper' | 'Side Lower';
  status: 'available' | 'booked' | 'selected' | 'rac' | 'waitlist';
  classType: string;
  coachNumber: string;
  price: number;
  positionIndex: number;
}

export interface Coach {
  coachNumber: string;
  classType: string;
  totalSeats: number;
  availableSeats: number;
  seats: Seat[];
}

export interface Payment {
  id: string;
  bookingId: string;
  pnr: string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  paymentMethod: 'Razorpay' | 'Stripe' | 'PayPal' | 'UPI' | 'Net Banking' | 'Credit Card' | 'Debit Card' | 'Wallet';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  cardLast4?: string;
  upiId?: string;
  couponCode?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minFare: number;
  description: string;
  validUntil: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  bookingId: string;
  pnr: string;
  refundAmount: number;
  cancellationFee: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reason: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'BOOKING_CONFIRMED' | 'CANCELLATION' | 'REFUND' | 'PLATFORM_CHANGE' | 'TRAIN_DELAY' | 'TRAIN_ARRIVAL' | 'JOURNEY_REMINDER' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILURE' | 'EMERGENCY_ALERT' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  channel: 'In-App' | 'Email' | 'Push' | 'SMS';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  isRead: boolean;
  timestamp: string;
  metadata?: any;
}

export interface Booking {
  id: string;
  pnr: string; // 10 digit unique PNR
  userId: string;
  passengerName: string;
  passengerEmail: string;
  passengers: Passenger[];
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  journeyDate: string;
  travelClass: string;
  seatNumber: string;
  coachNumber: string;
  fare: number;
  taxAmount?: number;
  discountAmount?: number;
  totalFare?: number;
  paymentId?: string;
  paymentMethod?: string;
  couponCode?: string;
  status: 'CONFIRMED' | 'RAC' | 'WAITLISTED' | 'CANCELLED';
  qrCodeData?: string;
  barcodeData?: string;
  platformNumber?: number;
  cancellationReason?: string;
  cancellationDate?: string;
  refundAmount?: number;
  bookingDate: string;
  createdAt: string;
}

export interface LiveTracking {
  trainNumber: string;
  trainName: string;
  originCode?: string;
  originName?: string;
  originCoords?: { lat: number; lng: number };
  destinationCode?: string;
  destinationName?: string;
  destinationCoords?: { lat: number; lng: number };
  currentStation: string;
  nextStation: string;
  status: string;
  delayMinutes: number;
  speedKmh: number;
  progressPercent: number;
  lastUpdated: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stopsPassed: StationStop[];
  upcomingStops: StationStop[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string; // e.g. "TRAIN_CREATED", "USER_LOGIN_SUCCESS"
  resource: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface SearchFilters {
  fromCode?: string;
  toCode?: string;
  date?: string;
  trainNumberOrName?: string;
  travelClass?: string;
  trainType?: string;
  sortBy?: 'departure' | 'duration' | 'fare';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
