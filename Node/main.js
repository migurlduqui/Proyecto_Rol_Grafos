import { Node } from './script.js';




function createSquare() {
    var container = document.getElementById("container");
    let n = new Node(50,50,"hola","hola");
    let square = n.Display();
    n.addEventListeners();
    container.appendChild(square);

}
document.addEventListener("DOMContentLoaded", function() {
    createSquare();
    const nodeButtom = document.getElementById("CreateNode");
    nodeButtom.addEventListener("click", createSquare);
});