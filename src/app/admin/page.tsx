"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  return (
    <main>
      <div className="mb-2 text-2xl font-bold">管理メニュー</div>
      <ul>
        <li>
          <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
          <Link className="text-blue-500 underline" href="/admin/collections">
            /admin/collections
          </Link>
        </li>
        <li>
          <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
          <Link className="text-blue-500 underline" href="/admin/collections/new">
            /admin/collections/new
          </Link>
        </li>
        <li>
          <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
          <Link className="text-blue-500 underline" href="/admin/tags">
            /admin/tags
          </Link>
        </li>
        <li>
          <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
          <Link className="text-blue-500 underline" href="/admin/tags/new">
            /admin/tags/new
          </Link>
        </li>
      </ul>
    </main>
  );
};

export default Page;