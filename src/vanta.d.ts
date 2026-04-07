declare module "vanta/dist/vanta.trunk.min" {
  type VantaEffect = {
    destroy: () => void;
  };

  type VantaTrunkOptions = {
    el: HTMLElement;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
  };

  const createTrunkEffect: (options: VantaTrunkOptions) => VantaEffect;
  export default createTrunkEffect;
}
