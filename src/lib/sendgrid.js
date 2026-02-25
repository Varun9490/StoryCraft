import sgMail from '@sendgrid/mail';

// Only set API key if it exists in env (to avoid crashing on boot)
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendOrderConfirmationEmail = async ({ to, orderDetails, isCOD }) => {
    if (!process.env.SENDGRID_API_KEY) {
        console.warn('SENDGRID_API_KEY not configured. Skipping email send.');
        return;
    }

    try {
        const itemsList = orderDetails.items.map(
            (item) => `<tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title_snapshot || 'Product'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${(item.price_at_order * item.quantity).toLocaleString('en-IN')}</td>
            </tr>`
        ).join('');

        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL || 'support@storycraft.com', // Must be registered in SendGrid
            subject: `Order Confirmation - StoryCraft #${orderDetails._id.toString().slice(-8)}`,
            html: `
                <div style="font-family: sans-serif; max-w-xl mx-auto p-5 border border-gray-200 rounded-xl">
                    <h1 style="color: #C4622D;">Thank you for your order!</h1>
                    <p>Your order has been placed successfully and is being processed by our artisan.</p>
                    
                    <h3>Order Details (ID: #${orderDetails._id.toString().slice(-8)})</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr style="background: #f9f9f9;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: left;">Qty</th>
                            <th style="padding: 10px; text-align: left;">Price</th>
                        </tr>
                        ${itemsList}
                    </table>

                    <p><strong>Total Amount:</strong> ₹${orderDetails.total_amount.toLocaleString('en-IN')}</p>
                    <p><strong>Payment Method:</strong> ${isCOD ? 'Cash on Delivery' : 'Paid Online'}</p>

                    <h4 style="border-top: 1px solid #eee; padding-top: 20px;">Delivery Address</h4>
                    <p>${orderDetails.delivery_address.street}</p>
                    <p>${orderDetails.delivery_address.city}, ${orderDetails.delivery_address.state} - ${orderDetails.delivery_address.pincode}</p>
                    <p>Phone: ${orderDetails.delivery_address.phone}</p>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">
                        Thank you for supporting hand-crafted stories.
                    </p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log('Order confirmation email sent successfully to', to);
    } catch (error) {
        console.error('SendGrid error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};
