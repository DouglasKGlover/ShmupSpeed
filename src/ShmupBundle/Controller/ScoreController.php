<?php

namespace ShmupBundle\Controller;

use ShmupBundle\Entity\Score;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Score controller.
 *
 * @Route("score")
 */
class ScoreController extends Controller
{
    /**
     * Lists all score entities.
     *
     * @Route("/", name="score_index")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $scores = $em->getRepository('ShmupBundle:Score')->findAll();

        return $this->render('ShmupBundle::score/index.html.twig', array(
            'scores' => $scores,
        ));
    }

    /**
     * Creates a new score entity.
     *
     * @Route("/new", name="score_new_scontroller")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request)
    {
        $score = new Score();
        $form = $this->createForm('ShmupBundle\Form\ScoreType', $score);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($score);
            $em->flush();

            return new Response(json_encode(array('status'=>'success')));
//            return $this->redirectToRoute('score_show', array('id' => $score->getId()));
        } else {
            return $this->render('ShmupBundle::score/new.html.twig', array(
              'score' => $score,
              'form' => $form->createView(),
            ));
        }
    }

    /**
     * Finds and displays a score entity.
     *
     * @Route("/{id}", name="score_show")
     * @Method("GET")
     */
    public function showAction(Score $score)
    {
        $deleteForm = $this->createDeleteForm($score);

        return $this->render('ShmupBundle::score/show.html.twig', array(
            'score' => $score,
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Displays a form to edit an existing score entity.
     *
     * @Route("/{id}/edit", name="score_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, Score $score)
    {
        $deleteForm = $this->createDeleteForm($score);
        $editForm = $this->createForm('ShmupBundle\Form\ScoreType', $score);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('score_edit', array('id' => $score->getId()));
        }

        return $this->render('ShmupBundle::score/edit.html.twig', array(
            'score' => $score,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Deletes a score entity.
     *
     * @Route("/{id}", name="score_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, Score $score)
    {
        $form = $this->createDeleteForm($score);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($score);
            $em->flush();
        }

        return $this->redirectToRoute('score_index');
    }

    /**
     * Creates a form to delete a score entity.
     *
     * @param Score $score The score entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(Score $score)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('score_delete', array('id' => $score->getId())))
            ->setMethod('DELETE')
            ->getForm()
        ;
    }
}
