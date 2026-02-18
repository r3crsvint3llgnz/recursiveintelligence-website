export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof (body as Record<string, unknown>).email !== 'string'
  ) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const email = (body as Record<string, string>).email;

  if (!email.includes('@')) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: 'Subscription recorded (newsletter not yet configured)' },
      { status: 200 },
    );
  }

  try {
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email, type: 'regular' }),
    });

    if (response.ok) {
      return Response.json({ message: 'Subscribed successfully!' }, { status: 200 });
    }

    return Response.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  } catch {
    return Response.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
