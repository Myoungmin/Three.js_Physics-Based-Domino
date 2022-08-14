import * as Three from '../three.js/three.module.js';
import { OrbitControls } from '../three.js/OrbitControls.js';

class App {
    constructor() {
        // id가 webgl-container인 div요소를 얻어와서, 상수에 저장 
        const divContainer = document.querySelector("#webgl-container");
        // 얻어온 상수를 클래스 필드에 정의
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._divContainer = divContainer;

        // 렌더러 생성, Three.js의 WebGLRenderer 클래스로 생성
        // antialias를 활성화 시키면 렌더링될 때 오브젝트들의 경계선이 계단 현상 없이 부드럽게 표현된다.
        const renderer = new Three.WebGLRenderer({ antialias: true });
        // window의 devicePixelRatio 속성을 얻어와 PixelRatio 설정
        // 디스플레이 설정의 배율값을 얻어온다.
        renderer.setPixelRatio(window.devicePixelRatio);
        // domElement를 자식으로 추가.
        // canvas 타입의 DOM 객체이다.
        // 문서 객체 모델(DOM, Document Object Model)은 XML이나 HTML 문서에 접근하기 위한 일종의 인터페이스.
        divContainer.appendChild(renderer.domElement);
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._renderer = renderer;

        // Scene 객체 생성
        const scene = new Three.Scene();
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._scene = scene;

        // 카메라 객체를 구성
        this._setupCamera();
        // 조명 설정
        this._setupLight();
        // 3D 모델 설정
        this._setupModel();
        // 마우스 컨트롤 설정
        this._setupControls();


        // 창 크기가 변경될 때 발생하는 이벤트인 onresize에 App 클래스의 resize 메서드를 연결한다.
        // this가 가리키는 객체가 이벤트 객체가 아닌 App클래스 객체가 되도록 하기 위해 bind로 설정한다.
        // onresize 이벤트가 필요한 이유는 렌더러와 카메라는 창 크기가 변경될 때마다 그 크기에 맞게 속성값을 재설정해줘야 한다.
        window.onresize = this.resize.bind(this);
        // onresize 이벤트와 상관없이 생성자에서 resize 메서드를 호출한다.
        // 렌더러와 카메라의 속성을 창크기에 맞게 설정해준다. 
        this.resize();

        // render 메서드를 requestAnimationFrame이라는 API에 넘겨줘서 호출해준다.
        // render 메서드 안에서 쓰이는 this가 App 클래스 객체를 가리키도록 하기 위해 bind 사용
        requestAnimationFrame(this.render.bind(this));
    }

    _setupCamera() {
        // 3D 그래픽을 출력할 영역 width, height 얻어오기
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        // 얻어온 크기를 바탕으로 Perspective 카메라 객체 생성
        const camera = new Three.PerspectiveCamera(
            75,
            width / height,
            0.1,
            100
        );
        camera.position.set(0, 20, 20);
        // 다른 메서드에서 참조할 수 있도록 필드에 정의한다.
        this._camera = camera;
    }

    _setupLight() {
        // 광원 색상 설정
        const color = 0xffffff;
        // 광원 세기 설정
        const intensity = 1;
        // 위 설정을 바탕으로 Directional 광원 객체 생성
        const light = new Three.DirectionalLight(color, intensity);
        // 광원 위치 설정
        light.position.set(-1, 2, 4);
        // Scene객체에 광원 추가
        this._scene.add(light);

        // AmbientLight 추가
        const ambientLight = new Three.AmbientLight(0xffffff, 1);
        this._scene.add(ambientLight);
    }

    _setupModel() {
        this._createTable();
        this._createDomino();
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);
    }

    _createTable() {
        const position = { x: 0, y: -0.525, z: 0 };
        const scale = { x: 30, y: 0.5, z: 30 };

        const tableGeometry = new Three.BoxGeometry();
        const tableMaterial = new Three.MeshPhongMaterial({ color: 0x070707 });
        const table = new Three.Mesh(tableGeometry, tableMaterial);

        table.position.set(position.x, position.y, position.z);
        table.scale.set(scale.x, scale.y, scale.z);

        table.receiveShadow = true;
        this._scene.add(table);
    }

    _createDomino() {
        const controlPoints = [
            [-10., 0., -10.],
            [10., 0., -10.],
            [10., 0., 10.],
            [-10., 0., 10.],
            [-10., 0., -8.],
            [8., 0., -8.],
            [8., 0., 8.],
            [-8., 0., 8.],
            [-8., 0., -6.],
            [6., 0., -6.],
            [6., 0., 6.],
            [-6., 0., 6.],
            [-6., 0., -4.],
            [4., 0., -4.],
            [4., 0., 4.],
            [-4., 0., 4.],
            [-4., 0., -2.],
            [2., 0., -2.],
            [2., 0., 2.],
            [-2., 0., 2.],
            [-2., 0., 0.],
            [0., 0., 0.],
        ];

        // contorlPoints를 이용하여 부드러운 curve를 Catmull-Romm Spline 알고리즘으로 정의한다.
        const p0 = new Three.Vector3();
        const p1 = new Three.Vector3();
        const curve = new Three.CatmullRomCurve3(
            controlPoints.map((p, ndx) => {
                if (ndx === controlPoints.length - 1) return p0.set(...p);
                p0.set(...p);
                p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);
                return [
                    (new Three.Vector3()).copy(p0),
                    (new Three.Vector3()).lerpVectors(p0, p1, 0.3),
                    (new Three.Vector3()).lerpVectors(p0, p1, 0.7),
                ];
            }).flat(), false
        );

        // Catmull-Romm Spline 알고리즘으로 생성한 curve를 시각화
        const points = curve.getPoints(1000);
        const geometry = new Three.BufferGeometry().setFromPoints(points);
        const material = new Three.LineBasicMaterial({ color: 0xffff00 });
        const curveObject = new Three.Line(geometry, material);
        this._scene.add(curveObject);
    }

    resize() {
        // 3D 그래픽을 출력할 영역 width, height 얻어오기
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        // 출력할 영역 width, height로 aspect 계산하여 카메라 aspect를 설정
        this._camera.aspect = width / height;
        // 변경된 aspect를 바탕으로 ProjectionMatrix 업데이트
        this._camera.updateProjectionMatrix();

        // 출력 영역 크기를 바탕으로 렌더러 크기 설정
        this._renderer.setSize(width, height);
    }

    render(time) {
        // Scene을 카메라 시점으로 렌더링하라는 코드
        this._renderer.render(this._scene, this._camera);
        // update 메서드 안에서는 time 인자를 바탕으로 애니메이션 효과 발생
        this.update(time);
        // requestAnimationFrame을 통하여 render 메서드가 반복적으로 호출될 수 있다.
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        // 밀리초에서 초로 변환
        time *= 0.001;
    }
}

window.onload = function () {
    new App();
}