import { NextRequest, NextResponse } from 'next/server';

const ECONT_API_URL = process.env.ECONT_API_URL || 'https://ee.econt.com/services/Shipments/LabelService.createLabel.json';
const ECONT_AUTH = process.env.ECONT_PRIVATE_KEY || 'Basic aWFzcC1kZXY6MUFzcC1kZXY=';

interface OrderItem {
  name: string;
  SKU: string;
  count: number;
  totalPrice: number;
  totalWeight: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerInfo, order_total } = body;

    const orderNumber = `PEP-${Date.now()}`;
    const totalWeight = items.reduce((acc: number, item: OrderItem) => acc + (item.totalWeight || 1), 0);
    const totalCount = items.reduce((acc: number, item: OrderItem) => acc + item.count, 0);

    const econtPayload = {
      label: {
        senderClient: {
          id: process.env.NEXT_PUBLIC_ECONT_SHOP_ID || "8663661",
          name: "Peptides Store",
          phones: ["+359886611719"]
        },
        senderAddress: {
          city: { country: { code3: "BGR" }, name: "София", postCode: "1715" },
          street: "ул. Д-р Атанас Москов", num: "7"
        },
        receiverClient: {
          name: customerInfo.name,
          phones: [customerInfo.phone],
          email: customerInfo.email
        },
        receiverAddress: {
          city: { country: { code3: "BGR" }, name: customerInfo.cityName, postCode: customerInfo.postCode },
          ...(!customerInfo.officeCode ? { street: customerInfo.address || "" } : {})
        },
        ...(customerInfo.officeCode ? { receiverOfficeCode: customerInfo.officeCode } : {}),
        packCount: totalCount,
        shipmentType: "PACK",
        weight: totalWeight,
        shipmentDescription: `Поръчка #${orderNumber}: ` + items.map((i: OrderItem) => i.name).join(', '),
        orderNumber: orderNumber,
        sendDate: new Date().toISOString().split('T')[0],
        services: {
          cd: order_total.toFixed(2),
          cd_currency: "BGN",
          sms_notification: 1
        },
        payAfterAccept: 1,
        paymentReceiverMethod: "cash",
      },
      mode: "create"
    };

    const response = await fetch(ECONT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': ECONT_AUTH },
      body: JSON.stringify(econtPayload),
    });

    const responseText = await response.text();
    let data;
    if (response.headers.get('content-type')?.includes('application/json')) {
      data = JSON.parse(responseText);
    } else {
      throw new Error("Invalid response from Econt API");
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to create Econt label");
    }

    const waybillNumber = data.label?.shipmentNumber || data.shipmentNumber;

    return NextResponse.json({
      success: true,
      id: orderNumber, 
      waybillNumber,
      econtResponse: data,
    });
  } catch (error) {
    console.error('Econt route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
