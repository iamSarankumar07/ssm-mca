const Student = require("../models/studentModel");
const moment = require("moment");
const crypto = require("crypto");
const paymentService = require("../services/paymentService");
const paypal = require("@paypal/checkout-server-sdk");
const paypalClient = require("../middleware/paypal");
const axios = require('axios');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const employeeModel = require("../models/adminModel");
const employeeSalaryModel = require("../models/employeeSalaryModel");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getTuitionCreatePaymentRazor = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId, isDelete: false, isAlumni: false });
    res.render('tuitionRazorPay', { studentData });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.createRazorPayPaymentByMail = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId, isDelete: false, isAlumni: false });
    res.render('payViaAlert', { studentData, signature: body.signature, paymentType: body.paymentType });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.getExamCreatePaymentRazor = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('examRazorPay', { studentData });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.payFromEmail = async (req, res) => {
  try {
    const { amount, paymentType, studentId, name, email, phone } = req.body;
    const txnId = "tnx_" + Date.now();
    const txnDate = moment().format("DD-MM-YYYY");

    const options = {
      amount: parseInt(amount) * 100,
      currency: "INR",
      receipt: txnId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.send({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      txnId,
      txnDate,
    });

    // return_url: `${req.protocol}://${req.get('host')}/v1/api/getCashfreeStatus?order_id=${encodeURIComponent(txnId)}&txnId=${encodeURIComponent(txnId)}&amount=${encodeURIComponent(reqBody.amount)}&name=${encodeURIComponent(reqBody.name)}&txnDate=${encodeURIComponent(txnDate)}&email=${encodeURIComponent(reqBody.email)}&phone=${encodeURIComponent(reqBody.phone)}&description=${encodeURIComponent(reqBody.description)}&studentId=${encodeURIComponent(reqBody.studentId)}&paymentType=${encodeURIComponent(reqBody.paymentType)}&year=${encodeURIComponent(reqBody.year)}`,

  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).send({ error: "Failed to create Razorpay order" });
  }
};

exports.createRazorPayPayment = async (req, res) => {
  try {
      const { amount, paymentType, studentId, name, email, phone } = req.body;
      const txnId = "txn_" + Date.now();
      const txnDate = moment().format("DD-MM-YYYY");

      const options = {
          amount: parseInt(amount) * 100,
          currency: "INR",
          receipt: txnId,
          payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);

      res.send({
        orderId: order.id,
        key: process.env.RAZORPAY_KEY_ID,
        txnId,
        txnDate,
      });
  } catch (err) {
      console.error("Error creating Razorpay order:", err);
      res.status(500).send({ error: "Failed to create Razorpay order" });
  }
};

exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { paymentId, orderId, signature, paymentType, studentId, name, email, phone, isEmailPay } = req.body;
        let reqBody = req.body;

        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        if (generatedSignature !== signature) {
            return res.status(400).send({ error: "Payment verification failed" });
        }

        const paymentDetails = await razorpay.payments.fetch(paymentId);

        if (paymentDetails && paymentDetails.status === "captured") {
          
          paymentDetails.paymentGateway = "Razorpay";

          paymentService.savePaymentData(reqBody, paymentDetails);
          paymentService.updateStudentPayment(reqBody, paymentDetails);

          let formattedAmount = paymentDetails.amount / 100;
          
          res.status(200).json({
              success: true,
              redirectUrl: `/v1/api/paymentSuccessRazorPay?txnId=${reqBody.txnId}&amount=${formattedAmount}&name=${reqBody.name}&txnDate=${reqBody.txnDate}&email=${reqBody.email}&phone=${reqBody.phone}&description=${paymentDetails.description}&isEmailPay=${isEmailPay}`,
          });
        } else {
            res.status(400).send({ error: "Payment capture failed" });
        }
    } catch (err) {
        console.error("Error verifying Razorpay payment:", err);
        res.status(500).send({ error: "Failed to verify Razorpay payment" });
    }
};

exports.paymentSuccessRazorPay = async (req, res) => {
  try {
    const {
      txnId,
      amount,
      name,
      txnDate,
      email,
      phone,
      description,
      isEmailPay,
    } = req.query;

    res.render("paymentSuccessRazorPay", {
      txnId,
      txnDate,
      amount,
      name,
      email,
      phone,
      description,
      isEmailPay,
    });
  } catch (err) {
    console.error("Error handling payment success:", err);
  }
};

exports.getTuitionCreatePaymentPaypal = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('tuitionPaypal', { studentData: studentData, clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.getExamCreatePaymentPaypal = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('examPaypal', { studentData: studentData, clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.createPaypalPayment = async (req, res) => {
  const { amount, currency } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
          {
              amount: {
                  currency_code: currency || "INR",
                  value: amount,
              },
          },
      ],
  });

  try {
      const order = await paypalClient.execute(request);
      res.json({ orderId: order.result.id });
  } catch (err) {
      console.error(err);
      res.status(500).send("Error creating PayPal Payment");
  }
};

exports.capturePaypalPayment = async (req, res) => {
  const { orderId } = req.body;

  let reqBody = req.body;
  const txnId = "txn_" + Date.now();
  const txnDate = moment().format("DD-MM-YYYY");

  reqBody.txnId = txnId;
  reqBody.txnDate = txnDate;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    if (capture && capture?.result && capture?.result?.purchase_units[0]?.payments?.captures[0]?.status === "COMPLETED"){
      let paymentData = {
        amount: capture?.result?.purchase_units[0]?.payments.captures[0]?.amount?.value? Number(capture.result.purchase_units[0].payments.captures[0].amount?.value) * 100 : reqBody?.amount * 100,
        currency: "INR",
        paymentGateway: "PayPal",
        method: "Card",
        description: reqBody.description
      };

      paymentService.savePaymentData(reqBody, paymentData);
      paymentService.updateStudentPayment(reqBody, paymentData);

      res.status(200).json({
        success: true,
        redirectUrl: `/v1/api/paymentSuccessRazorPay?txnId=${reqBody.txnId}&amount=${reqBody.amount}&name=${reqBody.name}&txnDate=${reqBody.txnDate}&email=${reqBody.email}&phone=${reqBody.phone}&description=${reqBody.description}`,
      });
    } else {
      res.json({
        status: "error",
        message: "Payer information is missing from the response"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error capturing PayPal Payment");
  }
};

exports.getTuitionCreatePaymentCashFree = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('tuitionCashFree', { studentData: studentData, clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.getExamCreatePaymentCashFree = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('examCashFree', { studentData: studentData, clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

const CASHFREE_BASE_URL = process.env.CASHFREE_ENVIRONMENT === "TEST" ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg"
const BASE_URL = process.env.BASE_URL === "UAT" ? "https://ssm-mca.onrender.com" : "http://localhost:9578"

const APP_ID = process.env.CASHFREE_APP_ID
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY1+process.env.CASHFREE_SECRET_KEY2;

exports.createCashfreePayment = async (req, res) => {
  try {
    let reqBody = req.body;
    const txnId = "txn_" + Date.now();
    const txnDate = moment().format("DD-MM-YYYY");
    const orderData = {
      order_id: txnId,
      order_amount: reqBody.amount,
      order_currency: "INR",
      order_note: reqBody.description,
      customer_details: {
        customer_name: reqBody.name,
        customer_phone: reqBody.phone,
        customer_email: reqBody.email,
        customer_id: reqBody.studentId, 
      },
      order_meta: {
        return_url: `${req.protocol}://${req.get('host')}/v1/api/getCashfreeStatus?order_id=${encodeURIComponent(txnId)}&txnId=${encodeURIComponent(txnId)}&amount=${encodeURIComponent(reqBody.amount)}&name=${encodeURIComponent(reqBody.name)}&txnDate=${encodeURIComponent(txnDate)}&email=${encodeURIComponent(reqBody.email)}&phone=${encodeURIComponent(reqBody.phone)}&description=${encodeURIComponent(reqBody.description)}&studentId=${encodeURIComponent(reqBody.studentId)}&paymentType=${encodeURIComponent(reqBody.paymentType)}&year=${encodeURIComponent(reqBody.year)}`,
        // notify_url: "http://localhost:9578/ssm/mca/webhook"
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "x-client-id": APP_ID,
      "x-client-secret": SECRET_KEY,
      "x-api-version": "2023-08-01",
    };

    const orderResponse = await axios.post(`${CASHFREE_BASE_URL}/orders`, orderData, { headers });

    if (orderResponse.status === 200) {
      const { order_id, order_amount, order_currency, payment_session_id } = orderResponse.data;

      const sessionData = {
        order_id: order_id,
        order_amount: order_amount,
        order_currency: order_currency,
        customer_details: orderData.customer_details,
        payment_session_id: payment_session_id,
        payment_method: {
          upi: {
            channel: "link",
            providers: ["gpay", "phonepe", "paytm", "bharatpe", "upi"]
          }
        }
      };

      const sessionResponse = await axios.post(`${CASHFREE_BASE_URL}/orders/sessions`, sessionData, { headers });

      if (sessionResponse.status === 200) {
        const paymentData = {
          orderId: orderResponse.data.order_id,
          amount: orderResponse.data.order_amount,
          currency: orderResponse.data.order_currency,
          paymentUrls: sessionResponse.data.data.payload,
          cfPaymentId: sessionResponse.data.cf_payment_id,
        }

        res.render("cashfreePayment", paymentData)
      } else {
        res.status(500).send("Error creating payment session");
      }
    } else {
      res.status(500).send("Error creating order");
    }
  } catch (error) {
    console.error("Error during payment creation:", error.response?.data || error.message);
    res.status(500).send("Error creating payment");
  }
};

exports.getCashfreeStatus = async (req, res) => {
  const { order_id, txnId, amount, name, txnDate, email, phone, description, studentId, paymentType, year } = req.query;

  let reqBody = {};
  reqBody.txnId = txnId;
  reqBody.amount = amount;
  reqBody.name = name;
  reqBody.txnDate = txnDate;
  reqBody.email = email;
  reqBody.year = year;
  reqBody.phone = phone;
  reqBody.description = description;
  reqBody.studentId = studentId;
  reqBody.paymentType = paymentType;
  try {
    const headers = {
      "Content-Type": "application/json",
      "x-client-id": APP_ID,
      "x-client-secret": SECRET_KEY,
      "x-api-version": "2023-08-01",
    }

    const orderResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${order_id}`, 
      { headers }
    );

    const paymentResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${order_id}/payments`,
      { headers }
    );

    let paymentRes = paymentResponse?.data[0] || {};

    if (paymentRes) {
      let paymentData = {
        amount: paymentRes.payment_amount * 100,
        currency: "INR",
        paymentGateway: "Cashfree",
        method: "UPI",
        description: reqBody.description
      };

      if (paymentRes.payment_status === "SUCCESS") {
        paymentService.savePaymentData(reqBody, paymentData);
        paymentService.updateStudentPayment(reqBody, paymentData);
      }

      let paymentStatus = paymentRes?.payment_status;

      setTimeout(() => {
        res.render("cashfreePaymentResponse", { txnId, txnDate, amount, name, email, phone, description, paymentStatus });
      }, 3000)
    }
  } catch (error) {
    console.error("Error checking payment status:", error.response?.data || error.message)
    res.status(500).send("Error checking payment status")
  }
};

exports.stripeTuitionPaymentEJS = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('stripeTuitionEjs', { studentData: studentData });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.stripeExamPaymentEJS = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('stripeExamEjs', { studentData: studentData });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.createStripePaymentEJS = async (req, res) => {
  const { paymentMethod, amount, studentId, name, email, phone, description } = req.body;
  let reqBody = req.body;
  let txnId = "txn_" + Date.now();
  let txnDate = moment().format("DD-MM-YYYY");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethod,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Tuition Fees for ${name}`,
              description: description,
            },
            unit_amount: parseInt(amount) * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.protocol}://${req.get('host')}/v1/api/getStripeStatus?session_id={CHECKOUT_SESSION_ID}&txnId=${encodeURIComponent(txnId)}&amount=${encodeURIComponent(reqBody.amount)}&name=${encodeURIComponent(reqBody.name)}&txnDate=${encodeURIComponent(txnDate)}&email=${encodeURIComponent(reqBody.email)}&phone=${encodeURIComponent(reqBody.phone)}&description=${encodeURIComponent(reqBody.description)}&studentId=${encodeURIComponent(reqBody.studentId)}&paymentType=${encodeURIComponent(reqBody.paymentType)}&year=${encodeURIComponent(reqBody.year)}&status=${encodeURIComponent('success')}`,
      cancel_url: `${req.protocol}://${req.get('host')}/v1/api/getStripeStatus?session_id={CHECKOUT_SESSION_ID}&txnId=${encodeURIComponent(txnId)}&amount=${encodeURIComponent(reqBody.amount)}&name=${encodeURIComponent(reqBody.name)}&txnDate=${encodeURIComponent(txnDate)}&email=${encodeURIComponent(reqBody.email)}&phone=${encodeURIComponent(reqBody.phone)}&description=${encodeURIComponent(reqBody.description)}&studentId=${encodeURIComponent(reqBody.studentId)}&paymentType=${encodeURIComponent(reqBody.paymentType)}&year=${encodeURIComponent(reqBody.year)}&status=${encodeURIComponent('cancel')}`,
      metadata: {
        // webhook_url: `${req.protocol}://${req.get('host')}/ssm/mca/stripe/webhook`,
        studentId: studentId,
        email: email,
        phone: phone,
        txnId: txnId,
        txnDate: txnDate,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe payment session:', error);
    res.status(500).send('Error creating payment session');
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const dynamicWebhookUrl = session.metadata?.webhook_url;

      console.log(`Payment completed for session ID: ${session.id}`);
      console.log(`Transaction ID: ${session.metadata.txnId}`);
      console.log(`Amount Paid: ${(session.amount_total / 100).toFixed(2)} INR`);

      if (dynamicWebhookUrl) {
        const forwardResponse = await fetch(dynamicWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event }),
        });

        if (forwardResponse.ok) {
          console.log(`Webhook successfully forwarded to: ${dynamicWebhookUrl}`);
        } else {
          console.error(`Error forwarding webhook: ${forwardResponse.statusText}`);
        }
      }
    }

    res.status(200).send('Webhook handled successfully');
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    res.status(400).send('Webhook verification failed');
  }
};

exports.stripePaymentResponse = async (req, res) => {
  const { session_id, txnId, amount, name, txnDate, email, phone, description, studentId, paymentType, year, status } = req.query;

  let reqBody = { txnId, amount, name, txnDate, email, phone, description, studentId, paymentType, year };

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session && session.payment_status === 'paid') {
      const paymentIntentId = session.payment_intent;

      const charges = await stripe.charges.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      const receiptUrl = charges.data.length > 0 ? charges.data[0].receipt_url : null;

      const paymentData = {
        amount: session.amount_total,
        currency: session.currency.toUpperCase(),
        paymentGateway: 'Stripe',
        method: session.payment_method_types[0],
        description: reqBody.description,
        receipt_url: receiptUrl,
      };

      paymentService.savePaymentData(reqBody, paymentData);
      paymentService.updateStudentPayment(reqBody, paymentData);

      const formattedAmount = (paymentData.amount / 100).toFixed(2);

      res.render('stripePaymentResponse', { txnId, txnDate, amount: formattedAmount, name, email, phone, description, paymentStatus: status, receiptUrl });
    } else {
      res.render('stripePaymentResponse', { txnId, txnDate, amount, name, email, phone, description, paymentStatus: status, receiptUrl: null });
    }
  } catch (error) {
    console.error("Error checking payment status:", error.response?.data || error.message);
    res.status(500).send("Error checking payment status");
  }
};

exports.getEmployeeSingleSalaryList = async (req, res) => {
  try {
    let employees = await employeeModel.find({ isDelete: false, isActive: true });

    res.render('employeeSingleSalaryList', { employees });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.getSalaryData = async (req, res) => {
  try {
    let month = parseInt(req.query.month);
    let year = parseInt(req.query.year);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ success: false, message: 'Invalid month or year' });
    }

    let employees = await employeeModel.find({
      isDelete: false,
      isActive: true,
      'transactions': {
        $elemMatch: {
          status: 'Paid',
          date: {
            $gte: new Date(year, month, 1),
            $lt: new Date(year, month + 1, 1)
          }
        }
      }
    });

    res.json({
      success: true,
      employees: employees
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      employees: []
    });
  }
};

exports.getEmployeeBulkSalaryList = async (req, res) => {
  try {
    let employees = await employeeModel.find({ isDelete: false, isActive: true });

    res.render('employeeBulkSalaryList');
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

async function generateAuthToken() {
  try {
    const SECRET_KEY = `${process.env.CASHFREE_PAYOUT_SECRET_1}${process.env.CASHFREE_PAYOUT_SECRET_2}`;
    const response = await axios.post(
      `https://payout-api.cashfree.com/payout/v1/authorize`,
      {},
      {
        headers: {
          "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID,
          "X-Client-Secret": SECRET_KEY,
        },
      },
    )

    if (response.data.status === "SUCCESS") {
      return response.data.data.token
    } else {
      throw new Error(response.data.message || "Failed to generate auth token")
    }
  } catch (err) {
    console.error("Auth Token Error:", err?.response?.data || err.message)
    throw new Error(`Authentication failed: ${err?.response?.data?.message || err.message}`)
  }
}

async function addBeneficiary(employee) {
  try {
    // const token = await generateAuthToken();
    const SECRET_KEY = `${process.env.CASHFREE_PAYOUT_SECRET_1}${process.env.CASHFREE_PAYOUT_SECRET_2}`;
    const response = await axios.post(
      `https://sandbox.cashfree.com/payout/beneficiary`,
      {
        beneficiary_id: employee._id.toString(),
        beneficiary_name: employee?.fullName,
        beneficiary_instrument_details: {
          bank_account_number: employee?.bankDetails?.accountNumber,
          bank_ifsc: employee?.bankDetails?.ifscCode,
          vpa: employee?.bankDetails?.upiId,
        },
        beneficiary_contact_details: {
          beneficiary_email: employee?.email,
          beneficiary_phone: employee?.phone,
          beneficiary_country_code: "+91",
          beneficiary_address: employee?.address || "",
          beneficiary_city: employee?.city || "",
          beneficiary_state: employee?.state || "",
          beneficiary_postal_code: employee?.pinCode || "",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_PAYOUT_CLIENT_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version": "2024-01-01",
        },
      },
    )

    if (response.data.beneficiary_status === "VERIFIED") {
      employee.beneId = employee._id.toString();
      await employee.save()
      console.log("Beneficiary Added Successfully:", employee.beneId)
    } else {
      throw new Error(response.data.message || "Failed to add beneficiary")
    }
  } catch (err) {
    console.error("Error Adding Beneficiary:", err?.response?.data || err.message)
    throw err
  }
};

async function paySalary(employee) {
  try {
    if (!employee.beneId) {
      console.log("Beneficiary ID not found. Creating one...")
      await addBeneficiary(employee)
    }

    const transferId = `txn_${Date.now()}`

    const SECRET_KEY = `${process.env.CASHFREE_PAYOUT_SECRET_1}${process.env.CASHFREE_PAYOUT_SECRET_2}`;

    const response = await axios.post(
      "https://sandbox.cashfree.com/payout/transfers",
      {
        beneficiary_details: {
          beneficiary_id: employee.beneId
        },
        transfer_amount: Number(employee?.currentMonthSalary),
        transfer_id: transferId,
        transferMode: "banktransfer",
        remarks: `Salary payment for ${new Date().toLocaleDateString()}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Client-Secret": SECRET_KEY,
          "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID,
          "X-Api-Version": "2024-01-01",
        },
      }
    );

    if (response.data.status === "RECEIVED") {

      let txnData = {
        amount: employee.salary,
        transactionId: response.data.transfer_id,
        status: "Paid",
        date: new Date(),
      }

      employee.transactions.push(txnData);

      await employee.save()
      txnData.date = moment(txnData.date).format("DD-MM-YYYY");
      paymentService.sendSalaryAlert(employee, txnData);
      return true
    } else {
      console.log("Error in payment:", response.data.message)
      return false
    }
  } catch (err) {
    console.error("Payment Error:", err?.response?.data || err.message)
    return false
  }
};

exports.employeePaySingleSalary = async (req, res) => {
  try {
    const employee = await employeeModel.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const firstDayOfMonth = new Date(new Date().setDate(1));
    const hasPaid = employee.transactions.some(
      (transaction) => transaction.status === 'Paid' && transaction.date >= firstDayOfMonth
    );

    if (hasPaid) return res.json({ success: false, message: 'Salary already paid for this month.' });

    let response = await paySalary(employee);
    if (!response) return res.json({ success: false, message: 'Error processing payment.' });
    res.json({ success: true, message: 'Salary paid successfully.' });
  } catch (err) {
    console.error('Error in employeePaySingleSalary:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Error processing salary payment' });
  }
};

exports.employeePayBulkSalary = async (req, res) => {
  try {
    const firstDayOfMonth = new Date(new Date().setDate(1));

    const employees = await employeeModel.find({
      transactions: {
        $not: {
          $elemMatch: {
            status: 'Paid',
            date: { $gte: firstDayOfMonth }
          }
        }
      },
      isDelete: false,
      isActive: true
    });

    if (employees.length === 0) return res.json({ success: false, message: 'All employees have already been paid for this month.' });

    const paymentPromises = [];

    employees.forEach((employee) => {
      paymentPromises.push(paySalary(employee));
    });

    const results = await Promise.all(paymentPromises);

    console.log(`Successfully processed salaries for ${results.length} employees.`);

    res.json({
      success: true,
      message: `Salaries processed for ${results.length} employees.`
    });
  } catch (err) {
    console.error('Error in employeePayBulkSalary:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Error processing bulk salary payments' });
  }
};


module.exports = exports;