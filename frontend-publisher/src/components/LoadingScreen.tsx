export default function LoadingScreen() {
  return (
    <div className="loading-overlay">
      <div className="hex-loader">
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
        <div className="hex"></div>
      </div>
      <p>Loading...</p>
    </div>
  );
}
