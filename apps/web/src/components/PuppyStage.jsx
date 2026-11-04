// The 3D puppy, with a photo for browsers that can't draw it.
import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { unsplash } from '../lib/img';

// Three.js is split into its own chunk and only loaded after the page is idle.
const Scene3D = lazy(() => import('./Scene3D'));

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
};

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const Loading = <div className="stage-fallback"><i /></div>;
// Only shown when WebGL is unavailable or the 3D scene fails to load.
const Fallback = (
  <div className="stage-fallback">
    <img src={unsplash('1587300003388-59208cc962cb', 700)} alt="A happy dog smiling at the camera" decoding="async" />
  </div>
);

export default function PuppyStage() {
  const [mountScene, setMountScene] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idle(() => setMountScene(hasWebGL() ? 'on' : 'off'));
  }, []);

  return (
    <>
      {!mountScene && Loading}
      {mountScene === 'off' && Fallback}
      {mountScene === 'on' && (
        <SceneBoundary fallback={Fallback}>
          <Suspense fallback={Loading}><Scene3D /></Suspense>
        </SceneBoundary>
      )}
    </>
  );
}
