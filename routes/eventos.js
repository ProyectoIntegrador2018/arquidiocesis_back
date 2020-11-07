/**
 * Module for managing Eventos
 * @module Evento
 */

/**
 * Gets all events documents for the list
 */
const getAll = async (firestore, req, res) => {
  console.log("eventos.getAll start");

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: "No tienes acceso a esta accion",
    });
  }

  try {
    const snapshot = await firestore.collection("eventos").get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.send({ error: false, data: events });
  } catch (error) {
    console.log("error :>> ", error);
    return res.send({ error: true, message: err.message });
  }
};

/**
 * Adds a new event to the 'eventos' collection
 */
const add = async (firestore, req, res) => {
  console.log("eventos.add start", req.body);

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: "No tienes acceso a esta accion",
    });
  }

  const { name, eventResponsible, eventDates } = req.body;

  try {
    const snapshot = await firestore
      .collection("eventos")
      .where("nombre", "==", name)
      .get();

    if (snapshot.docs.length > 0) {
      return res.send({
        error: true,
        message: "Ya existe un evento con ese nombre.",
      });
    }

    const newEvent = {
      nombre: name,
      responsable: eventResponsible,
      fechas: eventDates,
      fecha_creada: new Date(),
    };

    const docref = await firestore.collection("eventos").add(newEvent);
    newEvent.id = docref.id;

    return res.send({
      error: false,
      data: newEvent,
    });
  } catch (error) {
    console.log("error :>> ", error);
    return res.send({ error: true, message: err.message });
  }
};

module.exports = {
  getAll,
  add,
};
