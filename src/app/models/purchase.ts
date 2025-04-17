export interface Purchase {
    id: number;
    userId: number;
    formationId: number;
    purchaseDate: Date;
    paymentReference: string;
    isActive: boolean;
}