/**
 * Module for managing Objetivos
 * @module Objetivo
 */

/**
 * Gets all objectives documents for a given year
 */
const getAllByYear = async (firestore, req, res) => {
  console.log('objetivos.getAll start', req.params);

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: 'No tienes acceso a esta accion',
    });
  }

  try {
    const snapshot = await firestore
      .collection('objetivos')
      .where('year', '==', parseInt(req.params.year))
      .get();
    const objectives = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const objectivesByZonas = {};

    for (let i = 0; i < objectives.length; i++) {
      const objective = objectives[i];
      const decanatoSnap = await firestore
        .collection('decanatos')
        .doc(objective.decanatoId)
        .get();

      if (!decanatoSnap.exists) {
        throw new Error('Decanato doest not exist');
      }

      const decanato = decanatoSnap.data();

      if (!objectivesByZonas[decanato.nombreZona]) {
        objectivesByZonas[decanato.nombreZona] = [
          {
            decanato: decanato.nombre,
            objetivos: objective,
          },
        ];
      } else {
        objectivesByZonas[decanato.nombreZona].push({
          decanato: decanato.nombre,
          objetivos: objective,
        });
      }
    }

    return res.send({ error: false, data: objectivesByZonas });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({ error: true, message: err.message });
  }
};

/**
 * Updates a new objective
 */
const updateOne = async (firestore, req, res) => {
  console.log('objetivos.add start', req.body);

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: 'No tienes acceso a esta accion',
    });
  }

  const { id, p, cg, oc1, oc2, oc3 } = req.body;

  if (
    !id ||
    p === undefined ||
    cg === undefined ||
    oc1 === undefined ||
    oc2 === undefined ||
    oc3 === undefined
  ) {
    return res.send({
      error: true,
      message: 'Hacen falta datos para actualizar el objetivo',
    });
  }

  try {
    const objetivoSnap = await firestore.collection('objetivos').doc(id).get();
    if (!objetivoSnap.exists) {
      return res.send({ error: true, message: 'El objetivo no existe' });
    }

    const objective = { p, cg, oc1, oc2, oc3 };

    // Update new objective
    await firestore.collection('objetivos').doc(id).update(objective);
    return res.send({ error: false, data: true });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({ error: true, message: err.message });
  }
};

module.exports = {
  getAllByYear,
  updateOne,
};
