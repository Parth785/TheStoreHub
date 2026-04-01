import { paymentAPI } from '../services/api'

export function useRazorpay() {

  const initiatePayment = async (orderId, userDetails, onSuccess, onFailure) => {
    try {
      // create Razorpay order from backend
      const res = await paymentAPI.createPayment(orderId)
      const { razorpayOrderId, amount, currency, keyId } = res.data

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'arc.store',
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // verify payment with backend
            const verifyRes = await paymentAPI.verifyPayment(orderId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            if (verifyRes.data.success) {
              onSuccess(verifyRes.data)
            } else {
              onFailure('Payment verification failed')
            }
          } catch (err) {
            onFailure('Payment verification failed')
          }
        },
        prefill: {
          name: userDetails?.name || '',
          email: userDetails?.email || '',
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (err) {
      onFailure('Failed to initiate payment')
    }
  }

  return { initiatePayment }
}