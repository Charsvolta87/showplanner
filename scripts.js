const db = firebase.database();
const eventosRef = db.ref("eventos");
const pagosRef = db.ref("pagos");

// 🔹 Estados globales (NO eliminan nada, solo ordenan)
let totalNecesario = 0;
let totalPagado = 0;

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    const diaSemana = dias[fecha.getDay()];
    const diaNumero = fecha.getDate();
    const mes = meses[fecha.getMonth()];

    return `
        <div class="fecha-rock">
            <span class="fecha-dia">${diaSemana}-${diaNumero}</span>
            <span class="fecha-mes">${mes}</span>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {

    const calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"), {
            initialView: "dayGridMonth",
            events: []
        }
    );
    calendar.render();

    function actualizarUI(eventos) {
        const tbody = document.getElementById("eventos-table");
        tbody.innerHTML = "";
        calendar.removeAllEvents();

        // 🔹 antes era "let total = 0"
        // se mantiene la lógica pero se guarda en estado global
        totalNecesario = 0;

        eventos.forEach(evento => {
            if (evento.ir) totalNecesario += evento.precio;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formatearFecha(evento.fecha)}</td>
                <td>${evento.nombre}</td>
                <td>${evento.lugar}</td>
                <td>$${evento.precio.toFixed(2)}</td>
                <td>
                    <input type="checkbox" ${evento.ir ? "checked" : ""}>
                </td>
            `;

            row.querySelector("input").addEventListener("change", e => {
                eventosRef.child(evento.id).update({ ir: e.target.checked });
            });

            tbody.appendChild(row);

            calendar.addEvent({
                title: evento.nombre,
                start: evento.fecha,
                allDay: true
            });
        });

        // 🔹 salidas visuales (igual que antes, pero consistentes)
        document.getElementById("total").textContent =
            totalNecesario.toFixed(2);

        document.getElementById("falta").textContent =
            (totalNecesario - totalPagado).toFixed(2);
    }

    // 🔹 Listener de eventos
    eventosRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        const eventos = Object.keys(data).map(id => ({
            id,
            ...data[id]
        })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        actualizarUI(eventos);
    });

    // 🔹 Alta de evento (sin cambios funcionales)
    document.getElementById("evento-form").addEventListener("submit", e => {
        e.preventDefault();

        const nuevoEvento = {
            nombre: nombre.value,
            fecha: fecha.value,
            lugar: lugar.value,
            precio: parseFloat(precio.value) || 0,
            ir: false
        };

        eventosRef.push(nuevoEvento);
        e.target.reset();
    });

    // 🔹 Listener de pagos
    pagosRef.on("value", snapshot => {
        const data = snapshot.val() || {};

        totalPagado = Object.values(data)
            .reduce((acc, pago) => acc + pago.monto, 0);

        document.getElementById("pagado").textContent =
            totalPagado.toFixed(2);

        // 🔹 recalcula falta SIEMPRE que cambia un pago
        document.getElementById("falta").textContent =
            (totalNecesario - totalPagado).toFixed(2);
    });

    // 🔹 Agregar pago (sin cambios)
    document.getElementById("agregar-pago").addEventListener("click", () => {
        const input = document.getElementById("pago-input");
        const monto = parseFloat(input.value);

        if (!isNaN(monto) && monto > 0) {
            pagosRef.push({
                monto: monto,
                fecha: new Date().toISOString()
            });

            input.value = "";
        }
    });

});
