<?php

namespace ShmupBundle\Controller;

use ShmupBundle\Entity\Score;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $kb = $em->createQuery(
          "SELECT a 
            FROM ShmupBundle:Score a
                LEFT JOIN ShmupBundle:Score b 
                WITH a.platform = b.platform 
                AND a.name = b.name
                AND a.score < b.score
            WHERE b.score IS NULL
            AND a.platform = 'keyboard'
            ORDER BY a.score DESC, a.dateCreated ASC"
        );

        $cn = $em->createQuery(
          "SELECT a 
            FROM ShmupBundle:Score a
                LEFT JOIN ShmupBundle:Score b 
                WITH a.platform = b.platform 
                AND a.name = b.name
                AND a.score < b.score
            WHERE b.score IS NULL
            AND a.platform = 'controller'
            ORDER BY a.score DESC, a.dateCreated ASC"
        );

        $to = $em->createQuery(
          "SELECT a 
            FROM ShmupBundle:Score a
                LEFT JOIN ShmupBundle:Score b 
                WITH a.platform = b.platform 
                AND a.name = b.name
                AND a.score < b.score
            WHERE b.score IS NULL
            AND a.platform = 'touch'
            ORDER BY a.score DESC, a.dateCreated ASC"
        );

        $scoresKb = $kb->getResult();
        $scoresCn = $cn->getResult();
        $scoresTo = $to->getResult();

        $score = new Score();
        $form = $this->createForm('ShmupBundle\Form\ScoreType', $score);
        $form->handleRequest($request);

        return $this->render('ShmupBundle::Default/index.html.twig', array(
          'scoresKeyboard' => $scoresKb,
          'scoresController' => $scoresCn,
          'scoresTouch' => $scoresTo,
          'scoreForm' => $form->createView()
        ));
    }

    /**
     * @Route("/new", name="score_new")
     * @Method({"POST"})
     */
    public function newScoreAction(Request $request)
    {
        $score = new Score();
        $form = $this->createForm('ShmupBundle\Form\ScoreType', $score);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($score);
            $em->flush();

            return new Response(json_encode(array('status'=>'success')));
        } else {
            return $this->render('ShmupBundle::score/new.html.twig', array(
              'score' => $score,
              'form' => $form->createView(),
            ));
        }
    }

    /**
     * @Route("/score/{index}", name="share")
     * @Method("GET")
     */
    public function shareAction(Request $request)
    {
        return $this->render('ShmupBundle::Share/share.html.twig', array(
            'index' => $request->attributes->get('index')
        ));
    }
}
