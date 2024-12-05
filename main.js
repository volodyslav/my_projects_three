import * as THREE from 'three';
import { dataProjects, dataProjectsLinks, dataProjectsTitle } from './constants';
import { Reflector } from 'three/examples/jsm/Addons.js';
import {Easing, Tween, update as updateTween} from 'tween';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;
const textureLoader = new THREE.TextureLoader(); // texture loader

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const countProjects = dataProjects.length; // number of projects

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left.png");
const rightArrowTexture = textureLoader.load("right.png");

for (let i = 0; i < countProjects; i++) {
    const texture = textureLoader.load(dataProjects[i])
    texture.colorSpace = THREE.SRGBColorSpace;

    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = i  * ( 2 * Math.PI / countProjects ) ;
    rootNode.add(baseNode);

    const border = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 4.2, 0.09),
        new THREE.MeshStandardMaterial({ color: 0x999999 })  // gray color
    )
    border.position.z = -6;
    baseNode.add(border);

    const project = new THREE.Mesh(
        new THREE.BoxGeometry( 4, 4, 0.1),
        new THREE.MeshStandardMaterial( { map: texture, transparent: true } ) 
    );
    
    project.position.z = -6;
    baseNode.add(project);

    const leftArrow = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.01),
        new THREE.MeshStandardMaterial( { map: leftArrowTexture, transparent: true } ) 
    );
    leftArrow.name = 'leftArrow';
    leftArrow.userData = i;
    leftArrow.position.set(-4, 0, 5);
    baseNode.add(leftArrow);

    const rightArrow = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.01),
        new THREE.MeshStandardMaterial( { map: rightArrowTexture, transparent: true } ) 
    );
    rightArrow.name = 'rightArrow';
    rightArrow.userData = i;
    rightArrow.position.set(4, 0, 5);
    baseNode.add(rightArrow);

}

const mirror = new Reflector(
    new THREE.CircleGeometry(10),
    {
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
        color: 0x303030,
    }
)

mirror.position.y = -2.4;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

const spotLight = new THREE.SpotLight(0xffffff, 100, 10, 3, 2)
spotLight.position.set(0, -4, 0)
spotLight.target.position.set(0, 0.9, -5);
scene.add(spotLight)
scene.add(spotLight.target)

function rotateProjects(direction, newIndex) {
    const deltaY = direction * (2 * Math.PI / countProjects);
    new Tween(rootNode.rotation)
    .to({y: rootNode.rotation.y + deltaY})
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
        document.querySelector("#title").style.opacity = 0;
    })
    .onComplete(() => {
        document.querySelector("#title").style.opacity = 1;
        addAnchor(newIndex); 
    })
}

function animate() {
    updateTween();
	renderer.render( scene, camera );
}

window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (e) => {
    const rayscaler = new THREE.Raycaster();

    const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );

    rayscaler.setFromCamera(mouse, camera);
    const intersects = rayscaler.intersectObject(rootNode, true);
    
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        const newIndex = obj.userData;
        if (obj.name === "leftArrow"){
            rotateProjects(-1, newIndex);
        }
        if (obj.name === "rightArrow"){
            rotateProjects(1, newIndex);
        }
    }
})

function addAnchor(index){
    const titleElement = document.querySelector("#title");
    titleElement.innerHTML = "";
    const linkElement = document.createElement("a");
    linkElement.href = dataProjectsLinks[index];
    linkElement.target = "_blank";                 
    linkElement.textContent = dataProjectsTitle[index];
    titleElement.appendChild(linkElement);
}

addAnchor(3);