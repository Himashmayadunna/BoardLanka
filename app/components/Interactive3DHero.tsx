"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Interactive3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.8, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.2); // Emerald light
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x14b8a6, 2, 10); // Teal glow
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);

    // 3. Create the Main Floating Group
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Materials - Glassmorphism, Wireframe and Soft Shading
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 2,
    });

    const pinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Yellow/Amber location pin
      roughness: 0.3,
      metalness: 0.8,
    });

    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 0.9,
    });

    // Sub-function to create a house
    const createModernHouse = () => {
      const houseGroup = new THREE.Group();

      // Main Block
      const baseGeo = new THREE.BoxGeometry(2, 1.2, 1.6);
      const baseMesh = new THREE.Mesh(baseGeo, baseMaterial);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      houseGroup.add(baseMesh);

      // Wireframe Outline for high-tech look
      const baseEdge = new THREE.EdgesGeometry(baseGeo);
      const baseLine = new THREE.LineSegments(baseEdge, wireframeMaterial);
      houseGroup.add(baseLine);

      // Slanted Roof Box (Modern Architecture)
      const roofGeo = new THREE.BoxGeometry(2.2, 0.25, 1.8);
      const roofMesh = new THREE.Mesh(roofGeo, baseMaterial);
      roofMesh.position.set(0.1, 0.7, 0);
      roofMesh.rotation.z = -0.15; // Sleek architectural tilt
      houseGroup.add(roofMesh);

      const roofEdge = new THREE.EdgesGeometry(roofGeo);
      const roofLine = new THREE.LineSegments(roofEdge, wireframeMaterial);
      roofLine.position.copy(roofMesh.position);
      roofLine.rotation.copy(roofMesh.rotation);
      houseGroup.add(roofLine);

      // Big Window Panel (Glassmorphism)
      const windowGeo = new THREE.BoxGeometry(0.8, 0.7, 0.1);
      const windowMesh = new THREE.Mesh(windowGeo, glassMaterial);
      windowMesh.position.set(-0.4, 0.1, 0.81);
      houseGroup.add(windowMesh);

      // Main Door
      const doorGeo = new THREE.BoxGeometry(0.4, 0.8, 0.05);
      const doorMesh = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({ color: 0x0f766e }));
      doorMesh.position.set(0.5, -0.2, 0.81);
      houseGroup.add(doorMesh);

      return houseGroup;
    };

    const house = createModernHouse();
    heroGroup.add(house);

    // 4. Create floating accessories
    // A. Location Pin
    const createLocationPin = () => {
      const pinGroup = new THREE.Group();
      
      const coneGeo = new THREE.ConeGeometry(0.15, 0.35, 16);
      const cone = new THREE.Mesh(coneGeo, pinMaterial);
      cone.rotation.x = Math.PI; // point downwards
      cone.position.y = 0.175;
      pinGroup.add(cone);

      const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const sphere = new THREE.Mesh(sphereGeo, pinMaterial);
      sphere.position.y = 0.35;
      pinGroup.add(sphere);

      return pinGroup;
    };
    
    const pin = createLocationPin();
    pin.position.set(1.8, 0.8, 0.5);
    heroGroup.add(pin);

    // B. Clouds
    const createCloud = () => {
      const cloud = new THREE.Group();
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), cloudMaterial);
      s1.position.set(0, 0, 0);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), cloudMaterial);
      s2.position.set(0.25, -0.05, 0);
      const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), cloudMaterial);
      s3.position.set(-0.25, -0.05, 0);
      cloud.add(s1, s2, s3);
      return cloud;
    };

    const cloud1 = createCloud();
    cloud1.position.set(-1.8, 1.2, -0.8);
    heroGroup.add(cloud1);

    const cloud2 = createCloud();
    cloud2.position.set(1.5, 1.4, -1.2);
    cloud2.scale.set(0.8, 0.8, 0.8);
    heroGroup.add(cloud2);

    // C. Key
    const createKey = () => {
      const keyGroup = new THREE.Group();
      
      // Ring
      const ringGeo = new THREE.TorusGeometry(0.12, 0.04, 8, 24);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 }));
      ring.position.set(0, 0, 0);
      keyGroup.add(ring);

      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
      const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 }));
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.3, 0, 0);
      keyGroup.add(shaft);

      // Teeth
      const toothGeo = new THREE.BoxGeometry(0.04, 0.08, 0.04);
      const toothMaterial = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.1 });
      const tooth1 = new THREE.Mesh(toothGeo, toothMaterial);
      tooth1.position.set(0.42, -0.05, 0);
      const tooth2 = new THREE.Mesh(toothGeo, toothMaterial);
      tooth2.position.set(0.5, -0.05, 0);
      keyGroup.add(tooth1, tooth2);

      return keyGroup;
    };

    const key = createKey();
    key.position.set(-2, -0.6, 0.6);
    key.rotation.set(0.5, -0.5, 0.8);
    heroGroup.add(key);

    // D. Tree
    const createTree = () => {
      const tree = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.4, 8);
      const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
      trunk.position.y = 0.2;
      tree.add(trunk);

      const foliageGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
      const foliage = new THREE.Mesh(foliageGeo, new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.8 }));
      foliage.position.y = 0.6;
      tree.add(foliage);
      
      return tree;
    };
    const tree1 = createTree();
    tree1.position.set(-1.4, -0.6, 1.2);
    heroGroup.add(tree1);

    const tree2 = createTree();
    tree2.position.set(1.4, -0.6, 1.0);
    tree2.scale.set(0.9, 0.9, 0.9);
    heroGroup.add(tree2);

    // E. Small Apartment Building
    const createApartment = () => {
      const apt = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(0.6, 1.6, 0.6);
      const body = new THREE.Mesh(bodyGeo, baseMaterial);
      apt.add(body);

      const outlineGeo = new THREE.EdgesGeometry(bodyGeo);
      const outline = new THREE.LineSegments(outlineGeo, wireframeMaterial);
      apt.add(outline);

      // Tiny Window boxes
      const winMaterial = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2 });
      for(let y = -0.6; y <= 0.6; y += 0.3) {
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), winMaterial);
        w1.position.set(-0.15, y, 0.31);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), winMaterial);
        w2.position.set(0.15, y, 0.31);
        apt.add(w1, w2);
      }
      return apt;
    };
    const apt = createApartment();
    apt.position.set(2.2, -0.4, -0.5);
    heroGroup.add(apt);

    // 5. Setup Animation Loop & Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
    };

    container.addEventListener("mousemove", handleMouseMove);

    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Apply subtle rotations to main group
      heroGroup.rotation.y = elapsedTime * 0.15 + targetX * 0.35;
      heroGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.08 - targetY * 0.25;

      // Soft hover floating
      heroGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      // Rotate/float individual accessories
      pin.position.y = 0.8 + Math.sin(elapsedTime * 2.0) * 0.08;
      pin.rotation.y = elapsedTime * 1.5;

      key.rotation.y = elapsedTime * 0.8;
      key.position.y = -0.6 + Math.sin(elapsedTime * 1.8) * 0.06;

      cloud1.position.x = -1.8 + Math.sin(elapsedTime * 0.5) * 0.15;
      cloud2.position.x = 1.5 + Math.cos(elapsedTime * 0.6) * 0.15;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 6. Handle resizing
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose materials/geometries
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[350px] md:h-[500px] relative select-none cursor-grab active:cursor-grabbing z-10"
    />
  );
}
