test('QR scanner can detect and decode QR codes', async () => {
  // Create a mock video stream for the QR scanner
  const video = document.createElement('video');
  const stream = new MediaStream();
  const track = new MediaStreamTrack({ kind: 'video' });
  stream.addTrack(track);
  video.srcObject = stream;
  document.body.appendChild(video);

  // Create a mock QR code
  const qrCodeData = 'https://example.com';
  const qrCodeCanvas = document.createElement('canvas');
  qrCodeCanvas.width = 200;
  qrCodeCanvas.height = 200;
  const qrCode = new QRCode(qrCodeCanvas, {
    text: qrCodeData,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
  });
  qrCode.make();

  // Set up the QR scanner
  const qrScanner = new QRScanner(video, result => {
    expect(result).toEqual(qrCodeData);
    done();
  });

  // Start the QR scanner
  qrScanner.start();

  // Wait for the QR code to be detected
  await new Promise(resolve => {
    qrCodeCanvas.addEventListener('load', () => {
      track.applyConstraints({ width: 200, height: 200 });
      track.dispatchEvent(new Event('active'));
      track.dispatchEvent(new Event('ended'));
      resolve();
    });
  });

  // Clean up
  qrScanner.stop();
  video.srcObject = null;
  document.body.removeChild(video);
  qrCodeCanvas.remove();
});