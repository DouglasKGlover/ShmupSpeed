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

        /*$kb = $em->createQuery(
          'SELECT s.name, max(s.score) AS score, s.platform
            FROM ShmupBundle:Score s
            WHERE s.platform="keyboard"
            GROUP BY s.name
            ORDER BY s.score DESC'
        );*/

        $kb = $em->createQuery(
          "SELECT a 
          FROM ShmupBundle:Score a 
          WHERE a.platform='keyboard'
          ORDER BY a.score"
        );

        $cn = $em->createQuery(
          "SELECT b 
          FROM ShmupBundle:Score b
          WHERE b.platform='controller'
          ORDER BY b.score"
        );

        $to = $em->createQuery(
          "SELECT c 
          FROM ShmupBundle:Score c 
          WHERE c.platform='touch'
          ORDER BY c.score"
        );

        /*$query = $em->createQuery(
          'select l.*
            from ShmupBundle:Score l
            inner join (
            select
            name, max(score) as highest
            from ShmupBundle:Score
            group by name
            ) r
            on l.score = r.highest and l.name = r.name
            group by name
            order by r.highest desc, l.dateCreated'
        );*/

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
}
