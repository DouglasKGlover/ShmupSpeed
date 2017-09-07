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

        $query = $em->createQuery(
          'select s.name, max(s.score) as score
            from ShmupBundle:Score s
            group by s.name
            ORDER BY s.score DESC'
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

        $scores = $query->getResult();

        $score = new Score();
        $form = $this->createForm('ShmupBundle\Form\ScoreType', $score);
        $form->handleRequest($request);

        return $this->render('ShmupBundle::Default/index.html.twig', array(
          'scores' => $scores,
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
